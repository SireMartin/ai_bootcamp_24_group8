import { FunctionTool, OpenAIAgent } from "llamaindex";
import axios from 'axios';
import { error } from "console";


export const runtime="edge"

type outputSearch = {
    data : string
} 

type output={
  content: string,
  role: string,
  options: {}
}

type FormDataValues = {
  userImage:string
}



async function SearchWiki(query: string): Promise<outputSearch> {
    try {
      // Fetch search results
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
  
      // Fetch the page content for the first result
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

async function classifyImage(image:string): Promise<string|null>{
  const accessToken = process.env.Token
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const labels :string[] = ["dog","cat","snake","lion","camel","rabit","horse","cow","chicken","Something else"]
  const apiUrl:string = "https://api.jina.ai/v1/classify"

  const data = {
    model: "jina-clip-v2",
    input: [
      {
        image: image,
      },
    ],
    labels: labels,
  };

  const response = await axios.post(apiUrl, data, { headers });
  const prediction = response.data.data[0].prediction;
  return prediction



}

const Search = FunctionTool.from(async ({query}:{query:string})=>await SearchWiki(query),{
  name:"SeachWiki",
  description:"seach Wikipedia for introductory content given a query",
  parameters:{
    type:"object",
    properties : {
      query:{
        type:"string",
        description:"a query to search"
      }
    },
    required:["query"]
  }
})

const Agent = new OpenAIAgent({tools:[Search]});


export async function  POST(request:Request){
  try{
    const data = await request.formData()
    const userImage = data.get("userImage")
    if (userImage!=null && typeof userImage ==="string"){
      const image = userImage.replace(/^data:image\/\w+;base64,/, '');
      const prediction = await classifyImage(image)
       if (prediction!="Something else"){
         const searchResult = await Agent.chat({message:`Search some information on wiki about this animal ${prediction} then use these information to make pragraph desxribing this animal`})  
         return new Response(JSON.stringify({data:searchResult.message.content}), { status: 200 });
         
       }
        
     }

  }catch(error){
    return new Response(JSON.stringify({error:error}));
  }


}