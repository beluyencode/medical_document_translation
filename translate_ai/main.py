from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

src_text = [
    "en: I love you",
]

# Specify the multilingual model
model_name = "../models"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Tokenize the source text
inputs = tokenizer(src_text, return_tensors="pt", padding=True)

# Generate the translations
translated = model.generate(**inputs)

# Decode the translated text
tgt_text = [tokenizer.decode(t, skip_special_tokens=True) for t in translated]
print(tgt_text)