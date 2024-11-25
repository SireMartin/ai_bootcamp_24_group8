import  { NextResponse} from "next/server";
import {
  Document,
  MetadataMode,
  VectorStoreIndex,
  NodeWithScore,
} from "llamaindex";



type Input = {
    text:string;
    document: string;
};
  


type Output = {
    payload: string[];
};

export const runtime = "edge";

export async function POST(req:Request){

    try{
        const body = await req.json()
        const {text,document}: Input = body;
        
        //Create Document object with essay
        const Doc = new Document({ text: document, id_: "MyFile" });
    
        // Split text and create embeddings. Store them in a VectorStoreIndex
        const index = await VectorStoreIndex.fromDocuments([Doc]);
        const queryEngine = index.asQueryEngine();
        const { response, sourceNodes } = await queryEngine.query({
            query: `using the caracters of the file generate a stroy with this subject ${text}`,
        });
    
        const result :Output = {payload:[]}
        if (sourceNodes) {
            sourceNodes.forEach((source: NodeWithScore) => {
                result.payload.push(source.node.getContent(MetadataMode.NONE))
            });
        }
        
        return NextResponse.json(result, { status: 200 });

    }catch(error){
        return NextResponse.json(error, { status: 500 });
    }
    


}
