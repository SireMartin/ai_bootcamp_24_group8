import { FunctionTool, OpenAIAgent } from "llamaindex";
import axios from "axios";

export const runtime = "edge";

async function SearchWiki(query: string): Promise<{ data: string }> {
  try {
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*`
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch search results.");
    }

    const searchData = await searchResponse.json();
    const firstResult = searchData.query.search[0];

    if (!firstResult) {
      return { data: "No results found for the query." };
    }

    const title = firstResult.title;

    const contentResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(
        title
      )}&format=json&origin=*`
    );

    if (!contentResponse.ok) {
      throw new Error("Failed to fetch page content.");
    }

    const contentData = await contentResponse.json();
    const pages = contentData.query.pages;
    const pageId = Object.keys(pages)[0];
    const pageText = pages[pageId].extract;

    return { data: pageText };
  } catch (error) {
    console.error("Error fetching Wikipedia data:", error);
    throw new Error("Failed to fetch content.");
  }
}

async function classifyImage(image: string): Promise<string | null> {
  const apiKey = process.env.JINA_API_KEY;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const labels: string[] = [
    "dog",
    "cat",
    "snake",
    "lion",
    "camel",
    "rabbit",
    "horse",
    "cow",
    "chicken",
    "Something else",
  ];

  const apiUrl = "https://api.jina.ai/v1/classify";

  const data = {
    model: "jina-clip-v2",
    input: [{ image }],
    labels,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    const prediction = response.data.data[0].prediction;
    return prediction;
  } catch (error) {
    console.error("Error classifying image:", error);
    return null;
  }
}

const Search = FunctionTool.from(
  async ({ query }: { query: string }) => await SearchWiki(query),
  {
    name: "SearchWiki",
    description: "Search Wikipedia for introductory content given a query",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "a query to search",
        },
      },
      required: ["query"],
    },
  }
);

const Agent = new OpenAIAgent({
  tools: [Search],
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const userImage = data.get("userImage");

    if (userImage != null && typeof userImage === "string") {
      const image = userImage.replace(/^data:image\/\w+;base64,/, "");
      const prediction = await classifyImage(image);

      if (prediction && prediction !== "Something else") {
        const searchResult = await Agent.chat({
          message: `Search some information on wiki about this animal ${prediction} then use these information to make a paragraph describing this animal`,
        });

        if (
          searchResult.message &&
          typeof searchResult.message.content === "string"
        ) {
          let content = searchResult.message.content;

          const sentences = content.split(". ");
          content = sentences.slice(0, 2).join(". ") + ".";

          const dangerStatus =
            content.includes("dangerous") || content.includes("aggressive")
              ? "dangerous"
              : "not dangerous";

          return new Response(
            JSON.stringify({
              description: content,
              dangerStatus,
            }),
            { status: 200 }
          );
        } else {
          console.error("Invalid response structure:", searchResult);
          return new Response(
            JSON.stringify({ error: "Invalid response from agent." }),
            { status: 500 }
          );
        }
      } else {
        return new Response(
          JSON.stringify({
            error: "Image does not contain a recognizable animal.",
          }),
          { status: 400 }
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "No image uploaded." }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error during request:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during the process." }),
      { status: 500 }
    );
  }
}
