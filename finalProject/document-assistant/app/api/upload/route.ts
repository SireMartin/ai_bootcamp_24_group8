// import { IncomingForm, Files } from "formidable";
// import { NextApiRequest, NextApiResponse } from "next";

// interface FileData {
//   path: string;
//   name: string;
//   type: string;
// }

// interface FormData {
//   file: FileData[];
// }

// const parseFormData = (req: NextApiRequest): Promise<FormData> => {
//   return new Promise((resolve, reject) => {
//     const form = new IncomingForm();

//     form.parse(req, (err, fields, files: Files) => {
//       if (err) {
//         reject(err);
//       }

//       const formData: FormData = {
//         file: [] as FileData[],
//       };

//       if (files["file"]) {
//         if (Array.isArray(files["file"])) {
//           formData.file = files["file"].map((file) => ({
//             path: (file as { filepath: string }).filepath,
//             name: (file as { originalFilename: string }).originalFilename,
//             type: (file as { mimetype: string }).mimetype,
//           }));
//         } else {
//           const file = files["file"] as {
//             filepath: string;
//             originalFilename: string;
//             mimetype: string;
//           };
//           formData.file.push({
//             path: file.filepath,
//             name: file.originalFilename,
//             type: file.mimetype,
//           });
//         }
//       }

//       resolve(formData);
//     });
//   });
// };

// import { processReceipt } from "./processReceipt";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") {
//     try {
//       const formData = await parseFormData(req);
//       const uploadedFile = formData.file[0];
//       const result = await processReceipt(uploadedFile.path);

//       res.status(200).json(result);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error });
//     }
//   } else {
//     res.status(405).json({ error: "Method Not Allowed" });
//   }
// }

import { IncomingForm, Files } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

const uploadDir = path.join(process.cwd(), "public/uploads");

interface FileData {
  path: string;
  name: string;
  type: string;
}

interface FormData {
  file: FileData[];
}

const parseFormData = (req: NextApiRequest): Promise<FormData> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files: Files) => {
      if (err) {
        reject(err);
      }

      const formData: FormData = {
        file: [] as FileData[],
      };

      if (files["file"]) {
        if (Array.isArray(files["file"])) {
          formData.file = files["file"].map((file) => ({
            path: (file as { filepath: string }).filepath,
            name: (file as { originalFilename: string }).originalFilename,
            type: (file as { mimetype: string }).mimetype,
          }));
        } else {
          const file = files["file"] as {
            filepath: string;
            originalFilename: string;
            mimetype: string;
          };
          formData.file.push({
            path: file.filepath,
            name: file.originalFilename,
            type: file.mimetype,
          });
        }
      }

      resolve(formData);
    });
  });
};

async function processReceipt(filePath: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const imageBase64 = fs.readFileSync(filePath, "base64");

  const prompt = `Analyze this receipt and extract the following information in a structured format:
  - Merchant details (name, address, country, VAT number, bank account)
  - Document date
  - Line items with their quantities, prices (VAT exclusive and inclusive), VAT percentage, and discounts
  - Summary with totals and currency`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "user",
          content: `data:image/png;base64,${imageBase64}`,
        },
      ],
    });

    console.log("Processing result:", response);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error("Failed to process the image");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const formData = await parseFormData(req);
      const uploadedFile = formData.file[0];

      console.log("File path:", uploadedFile.path);

      const result = await processReceipt(uploadedFile.path);
      res.status(200).json({ text: result });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Failed to process the file" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
