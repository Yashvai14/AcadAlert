import os
import requests
import zipfile
from io import BytesIO

DATA_URL = "https://archive.ics.uci.edu/static/public/697/predict+students+dropout+and+academic+success.zip"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def download_and_extract():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    print("Downloading dataset...")
    response = requests.get(DATA_URL)
    response.raise_for_status()
    
    print("Extracting dataset...")
    with zipfile.ZipFile(BytesIO(response.content)) as z:
        z.extractall(DATA_DIR)
        
    print(f"Dataset extracted to {DATA_DIR}")

if __name__ == "__main__":
    download_and_extract()
