
import sys
import json
import easyocr
import os

def main():
    # Check if image paths are provided
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image paths provided"}))
        sys.exit(1)

    image_paths = sys.argv[1:]

    # Initialize EasyOCR
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)

    results = []

    for path in image_paths:
        # Check if file exists
        if not os.path.exists(path):
            results.append({
                "image": path,
                "error": "File does not exist"
            })
            continue

        try:
            # Extract text
            text = reader.readtext(path, detail=0)
            results.append({
                "image": path,
                "text": text
            })
        except Exception as e:
            results.append({
                "image": path,
                "error": str(e)
            })

    # Return JSON
    print(json.dumps({"results": results}, indent=2))

if __name__ == "__main__":
    main()
