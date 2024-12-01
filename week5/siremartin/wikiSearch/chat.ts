import { FunctionTool, OpenAIAgent, WikipediaTool } from "llamaindex";

// Tool 1: Fetch Wikipedia content
// const fetchWikiContent = FunctionTool.from(
//   async ({ query }: { query: string }) => {
//     // Simulate wiki fetch
//     return `Content about ${query}`;
//   },
//   {
//     name: "fetchWikiContent",
//     description: "Fetches content from Wikipedia",
//     parameters: {
//       type: "object",
//       properties: {
//         query: { type: "string", description: "Search query" }
//       },
//       required: ["query"]
//     }
//   }
// );

// Tool 2: Analyze content
const analyzeContent = FunctionTool.from(
  async ({ content }: { content: string }) => {
    return `Analyse according to the following if the properties of this animal makes it dangerous for humans: ${content}`;
  },
  {
    name: "determineIfAnimalIsDangerousForHumans",
    description: "Determine if the giver animal is dangerous for humans",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "The name of the animal" }
      },
      required: ["content"]
    }
  }
);

// Create agent with both tools
const agent = new OpenAIAgent({
  tools: [new WikipediaTool(), analyzeContent]
});

// Example usage with chaining
const response = agent.chat({
  message: `Follow these steps:
    1. Use the wikipedia tool for searching all information about an animal named 'cat'
    2. Pass that information from the wikipedia tool to the tool for determining if the animal is dangerous to humans
    3. Return the final analysis as a boolean and a score`
});
