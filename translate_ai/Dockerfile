# Use official Python image as base
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy necessary files
COPY requirements.txt .
COPY . .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose the FastAPI port
EXPOSE 8000

# Set environment variables
ENV TRAINING_INTERVAL=3600

# Run the application
CMD ["python3", "app.py"]
