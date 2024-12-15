// import { NextRequest, NextResponse } from "next/server";
// import Tesseract from "tesseract.js";
// import OpenAI from "openai";
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function extractTextFromImage(base64Image: string): Promise<string> {
//   const result = await Tesseract.recognize(base64Image, "eng", {
//     logger: (m: unknown) => console.log(m),
//   });
//   return result.data.text;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const base64Image = body.image;

//     const extractedText = await extractTextFromImage(base64Image);

//     const prompt = `Analyze this receipt and extract the following information in a structured format:
//     - Merchant details (name, address, country, VAT number, bank account)
//     - Document date
//     - Line items with their quantities, prices (VAT exclusive and inclusive), VAT percentage, and discounts
//     - Summary with totals and currency
//     Please make sure the output matches the specified JSON format.`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "user",
//           content: `${prompt}\n\n${extractedText}`,
//         },
//       ],
//     });

//     const result = JSON.parse(response.choices[0].message.content || "{}");

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error analyzing receipt:", error);
//     return NextResponse.json(
//       { error: "Failed to process image" },
//       { status: 500 }
//     );
//   }
// }
