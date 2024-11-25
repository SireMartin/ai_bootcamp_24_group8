import { revalidatePath } from 'next/cache'



export async function processText(prevState: any, formData: FormData) {
  const file = formData.get('file') as File
  const manualInput = formData.get('manualInput') as string

  let text = manualInput

  const fileContent = await file.text()


  const responce = await fetch("/api/retrive",{
    method:"Post",
    body:JSON.stringify({text:text,document:fileContent})
  });
  const result = await responce.json()

  return { 
    message: 'Text processed successfully', 
    output: result, 
  }
}

