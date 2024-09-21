import formidable from 'formidable';
import { exec } from 'child_process';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing the file:', err);
        return res.status(500).json({ message: 'Error processing the file' });
      }

      // Check if files.file is an array
      const uploadedFiles = files.file;
      const uploadedFile = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;

      // Log the uploaded file object for debugging
      console.log('Uploaded file:', uploadedFile);

      if (!uploadedFile || !uploadedFile.filepath) {
        console.error('No valid file was uploaded');
        return res.status(400).json({ message: 'No valid file uploaded' });
      }

      const filePath = uploadedFile.filepath || uploadedFile.path;

      // Call the Python script to classify the animal
      exec(`python3 image_classification.py "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${stderr}`);
          return res.status(500).json({ message: 'Error processing the image' });
        }

        // Get the result from the Python script
        const result = stdout.trim();
        res.status(200).json({ message: result });
      });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
