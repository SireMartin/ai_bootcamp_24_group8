import Tesseract from "tesseract.js";

export async function processReceipt(filePath: string) {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(m),
    });

    return result.data.text;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}
