// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Document, OpenAIAgent, WikipediaTool, VectorStoreIndex, QueryEngineTool } from "llamaindex";

type Input = {
  animalName: string;
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

  const { animalName }: Input = req.body;
  console.log("tha animal name is " + animalName);

  const wikiAgent = new OpenAIAgent({
    tools: [new WikipediaTool()],
    additionalChatOptions: { response_format: { type: "json_object" } },
    verbose: true
  });
  const wikiAgentResponse = await wikiAgent.chat({
    message: `Search Wikipedia for ${animalName} (as an animal) and return the complete content for the page`
  });
  console.log(wikiAgentResponse.message);
  res.status(200).json({ payload: { response: wikiAgentResponse.message.content.toString() } });

  //tried to use a second agent to analyse dangerousness but that didn't work

  /*const documents = [
    new Document({
      text: wikiAgentResponse.message.content.toString(),
      id_: "doc1"
    })
  ];
  const index = await VectorStoreIndex.fromDocuments(documents);
  const retriever = index.asRetriever({ similarityTopK: 1 });
  const queryEngine = index.asQueryEngine({ retriever: retriever });
  const ragTool = new QueryEngineTool({
    queryEngine: queryEngine,
    metadata: {
      name: "animal_properties",
      description: "the properties of an animal by which to evaluate if the animal is dangerous for humans"
    }
  })
  const dangerAgent = new OpenAIAgent({
    tools: [ragTool],
    additionalChatOptions: { response_format: { type: "json_object" } },
    verbose: true
  });
  const dangerAgentResponse = await dangerAgent.chat({
    message: "Determine, based on the properties provided in the vecorstore, if an animal is dangerous to humans. Answer with a boolean and a score. To get the properties of the animal, you have use the queryEngine of the vector store."
  });
  console.log(dangerAgentResponse.message);*/
}
