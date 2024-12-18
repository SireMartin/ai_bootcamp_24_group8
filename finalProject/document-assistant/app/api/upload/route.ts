import OpenAI, { toFile } from "openai";
import { useState } from "react";
import { NextResponse, NextRequest } from 'next/server';

const openai = new OpenAI();

export const runtime = "edge";

let documentIndex: number = 0;

export async function POST(req: NextRequest) {
  console.log("Received request");
  const { data } = await req.json();
  if(data === null){
    return NextResponse.json({message: "request contains no data"}, {status: 400});
  }
  const documentAssistantName: string = "documentAssistant";
  const documentAssistantVectorStoreName: string = "documentAssistantVectorStore";

  const developerInstructions = `You analyze images and extract all possible data from it. 
    As these images are generally scans or pictures taken from paper receipts and invoices, you have to scan for typical commercial fields.
    Just to name a few of these fields, but other typically invoice fields can be found:
    - Merchant details (name, address, zipcode, city, country, VAT number, bank account)
    - Buyer details (name, address, zipcode, city, country, VAT number, bank account). They come mostly if the document is an invoice and thus contains a VAT number.
    - Invoice details (invoice date, purchasing date, total price, currency, vat rate)
    - Line items with their name, quantities, VAT, prices (with and without vat) and unit price. These can both be products or services.
    If you can find a VAT number on the invoice, you will find prices with and without VAT. If both types of prices are not explicitly listed, you can calculate those based on a vat percentage, listed somewhere.
    Be aware that separate line items could be charged different amount of VAT, depending on the type of service provided.
    If you can find other invoice related fields on the document, feel free to add them to the result.
    The output you provide must be in JSON fromat.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "developer",
          content: [
            {
              type: "text",
              text: developerInstructions,
            }
          ]
        },
        {
          "role": "user",
          content:[
            {
              type: "image_url",
              image_url: {
                url: data,
              },
            },
            {
              type: "text",
              text: "Analyse the provided image of an invoice / receipt to extract all possible commercial data from it."
            }
          ],
        },
      ],
      response_format: {
        type: "json_object"
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

    //const f = await toFile(Buffer.from(JSON.stringify(result)), `${result.invoice.invoiceDate}-${result.merchant.name}.json`);
    const f = await toFile(Buffer.from(JSON.stringify(result)), `${vectorStoreId}_${documentIndex}.json`);
    documentIndex = documentIndex + 1;
    let fileCreateResp: {id: string} = await openai.files.create({file: f, purpose: "assistants"});
    //console.log(JSON.stringify("file id : " + fileCreateResp.id));
    openai.beta.vectorStores.files.create(vectorStoreId, {file_id: fileCreateResp.id});

    let listAssistantsResp = await openai.beta.assistants.list();
    let foundAsssistant = listAssistantsResp.data.find(x => x.name === documentAssistantName);
    if(foundAsssistant === undefined){
      const createdAssistant = await openai.beta.assistants.create({ model: "gpt-4o-mini", 
        name: documentAssistantName,
        description: "an assistant for your invoice and receipt data", 
        instructions: "You analyse extracted json data of invoice an receipt documents from your vector store. You provide answers to users questions about ticket and invoice content and make calculations through your code_interpreter on the data if necessary to achieve the results.",
        tools: [{type: 'file_search'}, {type: 'code_interpreter'}],
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