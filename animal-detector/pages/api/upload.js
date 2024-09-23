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

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!uploadedFile || !uploadedFile.filepath) {
        console.error('No valid file was uploaded');
        return res.status(400).json({ message: 'No valid file uploaded' });
      }

      const filePath = uploadedFile.filepath || uploadedFile.path;

      // Execute the Python script
      exec(`python image_classification.py "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${stderr}`);
          return res.status(500).json({ message: 'Error processing the image' });
        }

        const output = stdout.trim().split('\n');
        const label = output[0];
        const score = parseFloat(output[1]);
        const wikiInfo = output.slice(2, -1).join(' ');
        const dangerStatus = output[output.length - 1];

        // Check if dangerStatus is correctly parsed
        const isDangerous = dangerStatus.includes("Yes");

        // Debugging: Log what will be sent to the frontend
        console.log('Sending response to frontend:', {
          animal_detected: score > 0.85,
          animal_name: label,
          dangerous: isDangerous,
          confidence: score,
          wiki_info: wikiInfo,
        });

        res.status(200).json({
          animal_detected: score > 0.65,
          animal_name: label,
          dangerous: isDangerous,
          confidence: score,
          wiki_info: wikiInfo,
        });
      });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
