'use client'

import { useState ,useActionState} from 'react'
import { useFormState } from 'react-dom'
import { processText } from './actions'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ExtractedElement {
  name: string
  description: string
  activity: string
}

export default function TextProcessorPage() {
  const [state, formAction] = useActionState(processText, null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [story,setStory] = useState<string|null>(null);
  const [Error,setError] = useState<any>(null);
  const [input,setInput] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setFileName(file ? file.name : null)
  }
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };
  

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Text Processor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Text File
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90"
                  required
                />
                {fileName && <p className="mt-1 text-sm text-gray-500">Selected file: {fileName}</p>}
              </div>
              <div>
                <label htmlFor="manualInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  required
                  id="manualInput"
                  value={input}
                  onChange={handleTextChange}
                  name="manualInput"
                  rows={4}
                  placeholder="Be creative ..."
                  className="mt-1 block w-full"
                />
              </div>
              <Button type="submit" className="w-full">
                Generate Story
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          {state?.output && (
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-2">Processed Output:</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="whitespace-pre-wrap">{state.output.payload.join(" ")}</pre>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* {state?.extractedElements && state.extractedElements.length > 0 && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Extracted Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.extractedElements.map((element: ExtractedElement, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{element.name}</TableCell>
                    <TableCell>{element.description}</TableCell>
                    <TableCell>{element.activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}

