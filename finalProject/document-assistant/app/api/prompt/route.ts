import OpenAI from "openai";
import { NextResponse, NextRequest } from 'next/server';

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("Received request");
  const body: { question: string } = await req.json();
  const { question } = body;
  console.log(question);
  if(question === null){
    return NextResponse.json("BadRequest");
  }
  const documentAssistantName: string = "documentAssistant";

  let listAssistantsResp = await openai.beta.assistants.list();
  let foundAssistant = listAssistantsResp.data.find(x => x.name == documentAssistantName);
  if(foundAssistant !== undefined){
    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(thread.id, 
      {role: "user", content: [{ type: "text", text: question}]}
    );
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {stream: false, assistant_id: listAssistantsResp.data[0].id});
    if(run.status === "completed"){
      return NextResponse.json(message.content[0]);
    }
    else{
      return NextResponse.json({message: "run returns unexpected status " + run.status}, {status: 500});
    }
  }
  else{
    return NextResponse.json({message: "assistant does not exist yet, first upload some documents"}, {status: 400});
  }
}