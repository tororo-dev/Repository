import os
from src.menu import main

folders = ["data", "scraped"]
for folder in folders:
    os.makedirs(folder, exist_ok=True)

files = ["data/tokens.txt", "data/proxies.txt"]
for file in files:
    if not os.path.exists(file):
        with open(file, "a"):
            pass

if __name__ == "__main__":
    main()
