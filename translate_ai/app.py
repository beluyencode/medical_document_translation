import threading
import subprocess
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os
import schedule
import time
import logging
import requests

# Load environment variables
load_dotenv()

# Thiết lập logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Load model
model_name = "models"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Pydantic Models
class TranslationRequest(BaseModel):
    text: str

class TranslationsRequest(BaseModel):
    source_text: list[str]

class TrainingDataRequest(BaseModel):
    source_text: str
    target_text: str

class TrainingDatasRequest(BaseModel):
    data: list[TrainingDataRequest]

# API Routes
@app.post("/translate")
async def translate(request: TranslationRequest):
    inputs = tokenizer(["en: " + request.text], return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    tgt_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return {"translation": tgt_text}

@app.post("/translates")
async def translate_bulk(request: TranslationsRequest):
    inputs = tokenizer(["en: " + text for text in request.source_text], return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    tgt_texts = [tokenizer.decode(t, skip_special_tokens=True).replace("vi: ", "") for t in translated]
    return {"translation": tgt_texts}

@app.post("/add-training-data")
async def add_training_data(request: TrainingDataRequest):
    with open("data/train.source", "a", encoding="utf-8") as src_f, open("data/train.target", "a", encoding="utf-8") as tgt_f:
        src_f.write(request.source_text + "\n")
        tgt_f.write(request.target_text + "\n")
    return {"message": "Training data added successfully"}

@app.post("/add-training-datas")
async def add_training_datas(request: TrainingDatasRequest):
    with open("data/train.source", "a", encoding="utf-8") as src_f, open("data/train.target", "a", encoding="utf-8") as tgt_f:
        for item in request.data:
            src_f.write(item.source_text + "\n")
            tgt_f.write(item.target_text + "\n")
    return {"message": "Training data batch added successfully"}

@app.post("/reload-model")
async def reload_model():
    global tokenizer, model
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    return {"message": "Model reloaded successfully"}

@app.get("/train-model")
async def start_training():
    thread = threading.Thread(target=_train_model)
    thread.start()
    return {"message": "Model training started in background"}

@app.get("/")
async def root():
    return {"message": "Translation API"}

# Training function
def _train_model():
    logger.info("Starting model training...")
    result = subprocess.run(["python3", "scripts/training.py"], capture_output=True, text=True)
    
    if result.returncode == 0:
        logger.info("Training completed successfully.")
        logger.info(result.stdout)
        # Reload model
        response = requests.post("http://localhost:8000/reload-model")
        if response.status_code == 200:
            logger.info("Model reloaded successfully.")
        else:
            logger.error("Failed to reload model.")
    else:
        logger.error("Training failed.")
        logger.error(result.stderr)

# Scheduled training
def schedule_training():
    interval = int(os.getenv("TRAINING_INTERVAL", "60"))  # Interval in minutes
    logger.info(f"Scheduling model training every {interval} minutes.")
    schedule.every(interval).minutes.do(_train_model)
    while True:
        schedule.run_pending()
        time.sleep(1)

# Start scheduling thread
if __name__ == "__main__":
    threading.Thread(target=schedule_training, daemon=True).start()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
