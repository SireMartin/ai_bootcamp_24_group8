import sys
from PIL import Image
from transformers import pipeline

def classify_image(image_path):
    # Load the CLIP model and the zero-shot classification pipeline
    detector = pipeline(model="openai/clip-vit-large-patch14", task="zero-shot-image-classification")

    # Open the image
    image = Image.open(image_path)

    # Define the candidate labels you want to classify
    labels = ["cat", "dog", "lion", "tiger", "elephant", "zebra", "giraffe", "bear", "rabbit", "horse"]

    # Run the model on the image
    predictions = detector(image, candidate_labels=labels)

    # Get the highest confidence prediction
    top_prediction = predictions[0]
    return top_prediction["label"], top_prediction["score"]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python image_classification.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    label, score = classify_image(image_path)
    print(f"The detected animal is: {label} with confidence {score:.2f}")
