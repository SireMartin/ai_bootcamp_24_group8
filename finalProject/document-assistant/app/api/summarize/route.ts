import OpenAI from "openai";
import { NextResponse, NextRequest } from 'next/server';
import { strict } from "assert";
import { json } from "stream/consumers";

const openai = new OpenAI();

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const documentAssistantName: string = "documentAssistant";

  let listAssistantsResp = await openai.beta.assistants.list();
  let foundAssistant = listAssistantsResp.data.find(x => x.name == documentAssistantName);
  if(foundAssistant !== undefined){
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, 
      {role: "user", content: [{ type: "text", text: "give me the sum of the total amounts paid per merchant, based on all invoices"}]}
    );
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, { 
        stream: false, 
        assistant_id: listAssistantsResp.data[0].id,
        tool_choice: "auto",
        tools: [
          { 
            type: "file_search"
          },
          {
            type: "function", 
            function: {
              name: "plotTotalAmountPerMerchant",
              description: "function to plot a bar chart of the total amounts spent per merchant",
              parameters: {
                "type": "object",
                "properties":{
                  "merchantAmounts": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "merchantName": {
                          "type": "string"
                        },
                        "invoiceDate": {
                          "type": "string"
                        },
                        "totalAmount": {
                          "type": "number"
                        }
                      },
                      "required": [
                        "merchantName",
                        "invoiceDate",
                        "totalAmount"
                      ],
                      "additionalProperties": false
                    }
                  }
                },
                "required": [
                  "merchantAmounts"
                ],
                "additionalProperties": false
              },
              strict: true
            }
          }
        ],
        });
    if(run.status === "requires_action"){
      return NextResponse.json(JSON.parse(run.required_action!.submit_tool_outputs.tool_calls[0].function.arguments));
    }
    else{
      return NextResponse.json({message: "run returned unexpected status " + run.status}, {status: 500});
    }
  }
  else{
    return NextResponse.json({message: "assistant does not exist yet, first upload some documents"}, {status: 400});
  }
}