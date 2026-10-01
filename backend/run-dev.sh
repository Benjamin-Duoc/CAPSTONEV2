#!/bin/bash
# Script to run the backend in development mode

echo "Starting CIPRESS Backend in DEVELOPMENT mode..."

# Set environment variable
export FLASK_ENV=development

# Run the application
cd "$(dirname "$0")"
python run.py
