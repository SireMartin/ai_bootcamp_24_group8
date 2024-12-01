// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  Document,
  MetadataMode,
  NodeWithScore,
  VectorStoreIndex,
} from "llamaindex";

type Input = {
  inputDocument: string;
};

type Output = {
  error?: string;
  payload?: {
    response: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { inputDocument }: Input = req.body;
  console.log(inputDocument);

  // Create Document object with essay
  const document = new Document({ text: inputDocument });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const { response, sourceNodes } = await queryEngine.query({
    query: "is this animal dangerous to humans?",
  });

  // Output response with sources
  console.log(response);

  res.status(200).json({ payload: { response: response } });
}
