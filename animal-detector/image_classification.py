import sys
from PIL import Image
import wikipediaapi
from transformers import pipeline

def classify_image(image_path):
    detector = pipeline(model="openai/clip-vit-large-patch14", task="zero-shot-image-classification")
    image = Image.open(image_path)

    labels = ["cat", "dog", "lion", "tiger", "snake", "zebra", "giraffe", "bear", "hippopotamus", "scorpion"]
    predictions = detector(image, candidate_labels=labels)

    top_prediction = predictions[0]
    return top_prediction["label"], top_prediction["score"]

def find_wikipedia_info(animal_name):
    wiki_wiki = wikipediaapi.Wikipedia(
        language='en',
        extract_format=wikipediaapi.ExtractFormat.WIKI,
        user_agent="Animal-Detector/1.0 (zklemon@protonmail.com)"
    )

    page = wiki_wiki.page(animal_name)
    if not page.exists():
        return None, "No Wikipedia page found."

    return page.summary, None

def determine_danger_status_with_openai(info):
    prompt = f"Based on the following information, is this animal dangerous? {info} Please answer with 'Yes' or 'No'."
    return "Yes" if "lion" in info else "No"  # Simplified version for testing without OpenAI

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python image_classification.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    label, score = classify_image(image_path)

    if score > 0.65:
        wiki_info, error = find_wikipedia_info(label)
        if error:
            print(error)
            sys.exit(1)

        danger_status = determine_danger_status_with_openai(wiki_info)
        print(f"{label}\n{score:.2f}\n{wiki_info}\nDangerous: {danger_status}")
    else:
        print("This is not an animal or not in our list.")