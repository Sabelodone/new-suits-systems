#!/bin/bash

# Create the virtual environment
python3 -m venv venv

# Check if virtual environment creation was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to create virtual environment."
  exit 1
fi

# Activate the virtual environment
source venv/bin/activate

# Install dependencies from requirements.txt
pip3 install -r requirements.txt

# Check if dependency installation was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to install dependencies."
  exit 1
fi

# Run the server
python3 run.py