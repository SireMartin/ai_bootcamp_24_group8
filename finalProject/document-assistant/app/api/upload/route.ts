import OpenAI, { toFile } from "openai";
import { NextResponse, NextRequest } from 'next/server';

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("Received request");
  const { data } = await req.json();
  if(data === null){
    return NextResponse.json({message: "request contains no data"}, {status: 400});
  }
  const documentAssistantName: string = "documentAssistant";
  const documentAssistantVectorStoreName: string = "documentAssistantVectorStore";

  const prompt = `Analyze this receipt and extract the following information in a structured format:
  - Merchant details (name, address, zipcode, city, country, VAT number, bank account)
  - Invoice details (invoice data, total price, currency)
  - Line items with their name, quantities, price and unit price
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
                  "zipcode": {
                    "type": "string"
                  },
                  "city": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string"
                  },
                  "vat": {
                    "type": "string"
                  },
                  "bankAccount": {
                    "type": "string"
                  }
                },
                "required": [
                  "name",
                  "address",
                  "zipcode",
                  "city",
                  "country",
                  "vat",
                  "bankAccount"
                ],
                "additionalProperties": false
              },
              "invoice": {
                "type": "object",
                "properties": {
                  "invoiceDate": {
                    "type": "string"
                  },
                  "totalPrice": {
                    "type": "number"
                  },
                  "currency": {
                    "type": "string"
                  }
                },
                "required": [
                  "invoiceDate",
                  "totalPrice",
                  "currency"
                ],
                "additionalProperties": false
              },
              "lineItems": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "quantityItems": {
                      "type": "number"
                    },
                    "totalPrice": {
                      "type": "number"
                    },
                    "unitPrice": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "name",
                    "quantityItems",
                    "totalPrice",
                    "unitPrice",
                  ],
                  "additionalProperties": false
                }
              }
            },
            "required": [
              "merchant",
              "invoice",
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
    //console.log(JSON.stringify(listVectorStoreResp));
    let vectorStoreId: string = "";
    let foundVectorStore = listVectorStoreResp.data.find(x => x.name === documentAssistantVectorStoreName);
    if(foundVectorStore === undefined){
      const createVectorStoreResp = await openai.beta.vectorStores.create({name: documentAssistantVectorStoreName});
      vectorStoreId = createVectorStoreResp.id;
      console.log("created new vectorstore with id " + vectorStoreId);
    }
    else{
      vectorStoreId = foundVectorStore.id;
      console.log("using existing vectorstore with id " + vectorStoreId);
    }

    const f = await toFile(Buffer.from(JSON.stringify(result)), `${result.documentDate}-${result.merchant.name}.json`);
    let fileCreateResp: {id: string} = await openai.files.create({file: f, purpose: "assistants"});
    //console.log(JSON.stringify("file id : " + fileCreateResp.id));
    openai.beta.vectorStores.files.create(vectorStoreId, {file_id: fileCreateResp.id});

    let listAssistantsResp = await openai.beta.assistants.list();
    let foundAsssistant = listAssistantsResp.data.find(x => x.name === documentAssistantName);
    if(foundAsssistant === undefined){
      const createdAssistant = await openai.beta.assistants.create({ model: "gpt-4o-mini", 
        name: documentAssistantName,
        description: "an assistant for your invoice and receipt data", 
        instructions: "You vector store is filled with json data of parsed tickets and invoices. You provide answers to questions about ticket and invoice content and make calculations on the data. The json properties to use for retrieving documents, are the merchant.name and invoice.invoiceDate.",
        tools: [{type: 'file_search'}],
        tool_resources: {file_search: {vector_store_ids: [vectorStoreId]}}});
      console.log("created new assistent with id " + createdAssistant.id);
    }
    else{
      console.log("using extisting assistent with id " + foundAsssistant.id);
    }
    return NextResponse.json({message: result});
  } 
  catch (error) {
    console.error("Error analyzing receipt:", error);
    return NextResponse.json({message: error});
  }
}