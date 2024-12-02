'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function ImageUploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [outputText, setOutputText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsSubmitted(false) // Reset submission state when a new image is selected
    }
  }
  function fileToBase64(file:File):Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        resolve(fileReader.result as string); // Resolves with the base64 string
      };
      fileReader.onerror = (error) => {
        reject(error); // Rejects if there's an error in reading the file
      };
      fileReader.readAsDataURL(file); // Start reading the file as Data URL
    });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try{
      e.preventDefault();
      if (!selectedImage) {
        setOutputText('Please select an image first.')
        return
      }
  
      setIsLoading(true)
      setIsSubmitted(true)
      setOutputText('')
  
      //  API call
      const formData = new FormData();
      const base64Image = await fileToBase64(selectedImage)
      formData.append("userImage", base64Image);
      const responce = await fetch("/api/agent",{
        method:"POST",
        body:formData,
      })
      const content = await responce.json()
      setIsLoading(false)
      if (content.data) {
        setOutputText(content.data)
      }else{
        setOutputText(content.error)
      }
      
    }catch(error){
        console.log(error)
    }
    

  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8 w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Image Upload and Processing</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
            
            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-md"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedImage || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-black text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Process Image'
              )}
            </button>
          </form>

          {isSubmitted && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Output</h2>
              {isLoading ? (
                <div className="flex items-center justify-center h-24 bg-gray-100 rounded-md">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <div 
                  className="bg-gray-100 p-4 rounded-md text-gray-900"
                  aria-live="polite"
                >
                  {outputText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

