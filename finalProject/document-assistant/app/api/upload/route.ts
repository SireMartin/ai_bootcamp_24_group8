import OpenAI, { BadRequestError, toFile } from "openai";
import { NextResponse, NextRequest } from 'next/server';
import { json } from "stream/consumers";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("Received request");
  const body: { data: string } = await req.json();
  const { data } = body;
  console.log("data : " + data?.substring(0, 20));
  if(data === null){
    return NextResponse.json("BadRequest");
  }
  const documentAssistantName: string = "documentAssistant";
  const documentAssistantVectorStoreName: string = "documentAssistantVectorStore";
  //console.log(data.substring(0, 40));

  const prompt = `Analyze this receipt and extract the following information in a structured format:
  - Merchant details (name, address, country, VAT number, bank account)
  - Document date
  - Line items with their quantities, prices (VAT exclusive and inclusive), VAT percentage, and discounts
  - Summary with totals and currency
  Please ensure the output matches exactly the specified JSON structure.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: data,
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema", json_schema: {
          "strict": true, "name": "invoiceData", "schema": {
            "type": "object",
            "properties": {
              "merchant": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "address": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "vat": {
                    "type": "string"
                  },
                  "totalPriceVatExclusive": {
                    "type": "number"
                  },
                  "totalPriceVatInclusive": {
                    "type": "number"
                  },
                  "totalDiscount": {
                    "type": "number"
                  },
                  "currency": {
                    "type": "string"
                  }
                },
                "required": [
                  "name",
                  "address",
                  "country",
                  "vat",
                  "totalPriceVatExclusive",
                  "totalPriceVatInclusive",
                  "totalDiscount",
                  "currency"
                ],
                "additionalProperties": false
              },
              "documentDate": {
                "type": "string",
              },
              "lineItems": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "quantity": {
                      "type": "number"
                    },
                    "priceVatExclusive": {
                      "type": "number"
                    },
                    "priceVatInclusive": {
                      "type": "string"
                    },
                    "unitPriceVatExclusive": {
                      "type": "number"
                    },
                    "unitPriceVatInclusive": {
                      "type": "string"
                    },
                    "vatPercentage": {
                      "type": "number"
                    },
                    "priceDiscount": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "name",
                    "quantity",
                    "priceVatExclusive",
                    "priceVatInclusive",
                    "unitPriceVatExclusive",
                    "unitPriceVatInclusive",
                    "vatPercentage",
                    "priceDiscount"
                  ],
                  "additionalProperties": false
                }
              }
            },
            "required": [
              "merchant",
              "documentDate",
              "lineItems"
            ],
            "additionalProperties": false
          }
        }
      },
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    console.log(JSON.stringify(result));

    let listVectorStoreResp = await openai.beta.vectorStores.list();
    console.log(JSON.stringify(listVectorStoreResp));
    let vectorStoreId: string = "";
    if((listVectorStoreResp.data?.length ?? 0) > 0  && listVectorStoreResp.data[0].name === documentAssistantName)
    {
      vectorStoreId = listVectorStoreResp.data[0].id;
    }
    else{
      const createVectorStoreResp = await openai.beta.vectorStores.create({name: documentAssistantName});
      vectorStoreId = createVectorStoreResp.id;
    }

    const f = await toFile(Buffer.from(JSON.stringify(result)), `${result.documentDate}-${result.merchant.name}.json`);
    let fileCreateResp: {id: string} = await openai.files.create({file: f, purpose: "assistants"});
    console.log(JSON.stringify("file id : " + fileCreateResp.id));
    openai.beta.vectorStores.files.create(vectorStoreId, {file_id: fileCreateResp.id});

    let listAssistantsResp = await openai.beta.assistants.list();
    if((listAssistantsResp.data?.length ?? 0) === 0 || listAssistantsResp.data[0].name !== documentAssistantName){
      await openai.beta.assistants.create({ model: "gpt-4o-mini", 
        name: documentAssistantName,
        description: "an assistant for your invoice and receipt data", 
        instructions: "Your read and interpret tickets and invoices. You provide answers about ticket and invoice content and make calculations on image content to solve the questions",
        tools: [{type: 'file_search'}],
        tool_resources: {file_search: {vector_store_ids: [vectorStoreId]}}});
    }

    return NextResponse.json({result});
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw error;
  }
}