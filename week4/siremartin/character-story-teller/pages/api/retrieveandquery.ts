// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  IndexDict,
  OpenAI,
  RetrieverQueryEngine,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import { json } from "stream/consumers";

type Input = {
  query: string;
  topK?: number;
  nodesWithEmbedding: {
    text: string;
    embedding: number[];
  }[];
  temperature: number;
  topP: number;
};

type Output = {
  error?: string;
  payload?: {
    response: string;
  };
};

export const runtime = "nodejs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, topK, nodesWithEmbedding, temperature, topP }: Input =
    req.body;

  const embeddingResults = nodesWithEmbedding.map((config) => {
    return new TextNode({ text: config.text, embedding: config.embedding });
  });
  const indexDict = new IndexDict();
  for (const node of embeddingResults) {
    indexDict.addNode(node);
  }

  const index = await VectorStoreIndex.init({
    indexStruct: indexDict,
    serviceContext: serviceContextFromDefaults({
      llm: new OpenAI({
        model: "gpt-4-1106-preview",
        temperature: temperature,
        topP: topP,
        additionalChatOptions: { response_format: { type: "json_object"}}
      }),
    }),
  });

  index.vectorStore.add(embeddingResults);
  if (!index.vectorStore.storesText) {
    await index.docStore.addDocuments(embeddingResults, true);
  }
  await index.indexStore?.addIndexStruct(indexDict);
  index.indexStruct = indexDict;

  const retriever = index.asRetriever();
  retriever.similarityTopK = topK ?? 2;

  const queryEngine = new RetrieverQueryEngine(retriever);

  const responseJsonSchema = {
    characters: [
      {
        id: "a unique numerical identification of the object",
        name: "the name of the character",
        description: "a description of the character",
        personality: "the personality of the caracter"
      }
    ]
  }
  
  /*{
    name: "the name of the character",
    description: "a description of the character",
    personality: "the personality of the caracter"
  };*/

  const result = await queryEngine.query(`Extract a list of the characters from the story. The answer should be a valid json array with the following schema: ${JSON.stringify(responseJsonSchema)}`);

  res.status(200).json({ payload: { response: result.response } });
}
