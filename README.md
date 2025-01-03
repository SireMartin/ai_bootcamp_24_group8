# Final Project Encode AI Bootcamp 24 Group 8 Repo
# Invoice Assistant
A RAG based system to upload your scanned documents and ask questions about it.<br/>
Also 2 additional BI tabs are added.<br/>

## Run Info
export your open ai key OPENAI_API_KEY=...<br/>
go to dir root/finalProject/document-assistant<br/>
npm install<br/>
npm run dev<br/>

## Common Info
All clients use same assistant and vector store, as long as they share the same openai api key.<br/>
I was not able to work with images in openai vector store, so we use ai to extract data from document and put the result in the vectorstore<br/>

## The Source

### Endpoint Info
The various endopoints can be found in the app/api folder with their resp. name<br/>

#### Upload
Lets the model extract any invoice related data from the provided base64-encoded image and save it to a vector store.<br/>
Calls the multi-modal text completion api with image and asks for invoice info and supply result through structured output.<br/>
If not existing yet, create an assistant with the file_search tool and vector store.<br/>
Add the json file to the vector store.<br/><br/>
![image](https://github.com/user-attachments/assets/cc0b9e6f-f1d5-43eb-acbd-e864e9c762b9)<br/>


#### Prompt
Creates a thread on the assistant and provides the prompt as a message to it.<br/>
Because of thread creation, the model knows to use the file_search to answer the question.<br/>
The prompt has no context, so only the question itself is provided and not the previous.<br/>

#### Summarize
Tab "upload history" and "insights" use data from this endpoint.<br/>
Used a little hack to get structured output from the assistant and still be able to use file_search tool.<br/>
__Error: 400 Invalid tools: all tools must be of type `function` when `response_format` is of type `json_schema`__<br/><br/>
![image](https://github.com/user-attachments/assets/a48c28df-1df7-44b1-8c71-e9d755dad1cc)<br/><br/>
Added an extra function tool next to the file_search tool and used its parameters as structured output (check on run.status == "required_action").<br/><br/>
![image](https://github.com/user-attachments/assets/84df4c56-efe6-47a7-8366-24a3ea125b14)
