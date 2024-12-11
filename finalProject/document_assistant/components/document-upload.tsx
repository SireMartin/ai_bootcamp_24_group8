"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DocumentUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }
  })

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label htmlFor="document-upload">Upload Document</Label>
          <div
            {...getRootProps()}
            className="mt-2 border-2 border-dashed border-primary/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <input {...getInputProps()} id="document-upload" />
            {isDragActive ? (
              <p className="text-lg">Drop the file here ...</p>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-primary" />
                <p className="text-lg">Drag & drop a document here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supported formats: PDF, PNG, JPG, JPEG</p>
              </div>
            )}
          </div>
        </div>
        {uploadedFile && (
          <Alert>
            <File className="h-4 w-4" />
            <AlertTitle>Document uploaded</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{uploadedFile.name}</span>
              <Button onClick={() => {/* TODO: Implement document processing */}}>
                Process Document
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

