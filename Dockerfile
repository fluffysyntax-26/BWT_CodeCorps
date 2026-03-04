FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for Tesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
