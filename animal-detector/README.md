# Animal Detector App

This project is a web application that uses a machine learning model to classify animals in uploaded images and determine whether the detected animal is dangerous. The app also provides detailed information from Wikipedia about the detected animal.

## Features

- **Image Classification**: Detects animals in images using a zero-shot image classification model.
- **Danger Assessment**: Uses OpenAI's language model to assess whether the detected animal is dangerous.
- **Wikipedia Information**: Fetches and displays information about the animal from Wikipedia.
- **Modern UI**: A modern and responsive front-end built with React and Chakra UI.

## Technologies Used

- **Frontend**: 
  - React
  - Chakra UI
  - Axios for API requests

- **Backend**: 
  - Node.js with Next.js API routes
  - Formidable for file uploads
  - Python for image classification and dangerous animal detection
  - OpenAI API for danger assessment
  - Wikipedia API for fetching animal information

- **Machine Learning**:
  - OpenAI CLIP model for zero-shot image classification
  - OpenAI GPT-3.5 for natural language processing

## Setup Instructions

### Prerequisites

- Node.js installed
- Python 3.x installed
- OpenAI API key
- Python libraries listed in `requirements.txt`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/animal-detector-app.git
   cd animal-detector-app
   
2. **Install Node.js dependencies**:
   ```bash
   npm install

3. **Set up Python environment**:
   - Create a virtual environment:
     ```bash
     python3 -m venv env
     source env/bin/activate  # On Windows use: .\env\Scripts\activate
     ```
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```
4. **Run the Next.js app**:
   - Make sure your virtual environment is activated (if using one).
   - In the project root directory, install the Node.js dependencies:
     ```bash
     npm install
     ```
   - Then, run the Next.js development server:
     ```bash
     npm run dev
     ```
   - Your app should now be running on `http://localhost:3000`.

5. **Upload and classify an image**:
   - Once the app is running, open your browser and navigate to `http://localhost:3000`.
   - You will see the interface with a "Select File" button.
   - Click on "Select File" to browse and upload an image of an animal.
   - Once the upload is complete, the app will:
     - Detect the animal in the image.
     - Display the name, confidence score, and whether the animal is dangerous.
     - Show a brief summary from Wikipedia about the detected animal.
   - If no valid animal is detected, you will see a message saying "This doesn't seem to be an animal."
     
6. **How the system works**:
   - **Frontend**:
     - Users upload an image via the web interface built using React and Chakra UI.
     - The frontend sends the image to the backend via an API call to `/api/upload`.
   - **Backend**:
     - The backend, using `formidable`, processes the uploaded image.
     - The image is passed to a Python script (`image_classification.py`) where:
       - The image is analyzed by a machine learning model (OpenAI CLIP) to classify the animal.
       - The Wikipedia API retrieves a summary for the detected animal.
       - OpenAI GPT-3.5 assesses whether the animal is dangerous based on the Wikipedia summary.
     - The backend returns the results (animal name, danger status, confidence, and Wikipedia summary) to the frontend.
   - **Result Display**:
     - The frontend displays the animal image, its name, confidence score, whether it is dangerous, and the Wikipedia summary.
     - If no animal is detected, the app shows a message saying "This doesn't seem to be an animal."

7. **Potential improvements**:
   - **Expanding Animal Database**: 
     - Add more animals to the list of detectable species by expanding the `candidate_labels` in the model to include a wider variety of animals, making the system more comprehensive.
   - **Improving Dangerous Detection**:
     - Refine the OpenAI GPT-3.5 prompt or switch to a more structured way of determining danger level based on specific traits or data rather than relying on a natural language response.
   - **Better Image Handling**:
     - Improve the image classification pipeline to support a broader range of image types and qualities.
   - **Performance Optimizations**:
     - Consider optimizing the image processing and model inference steps to reduce the time taken to classify images and return results.
   - **Error Handling**:
     - Add more robust error handling in the frontend and backend to manage issues such as invalid image formats, server timeouts, or unexpected API errors.
   - **Styling Enhancements**:
     - Further improve the user interface for a more modern and visually appealing design, including responsive layouts for better mobile compatibility.


API Endpoints

    POST /api/upload: Handles image uploads and processes the image through the Python script.
    POST /api/danger-status: Receives information from Wikipedia and asks OpenAI if the animal is dangerous.

How It Works

    Upload an Image: Users can upload an image file using the "Select File" button.
    Backend Processing:
        The image is sent to the upload API route, where it is processed using Python's machine learning model (image_classification.py).
        The Python script returns the detected animal, confidence score, and Wikipedia summary.
        The backend then asks OpenAI if the animal is dangerous.
    Display Results: The frontend displays the detected animal, confidence score, dangerous status, and animal details from Wikipedia.

Troubleshooting

    API Key Issues: Make sure your .env file contains a valid OpenAI API key.
    Python Errors: Ensure all Python dependencies are installed correctly by checking the requirements.txt file.

Contributing

Feel free to submit issues or pull requests to improve this project.
License

This project is licensed under the MIT License.
