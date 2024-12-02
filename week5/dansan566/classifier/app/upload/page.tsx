'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { classifyAnimal, loadModel } from '@/utils/animalClassification'

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [animalClass, setAnimalClass] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    loadModel() // Pre-load the model when the component mounts
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleUpload = async () => {
    if (!image || !imageRef.current) {
      alert('Please select an image first.')
      return
    }

    setIsUploading(true)
    setAnimalClass(null)

    try {
      const result = await classifyAnimal(imageRef.current)
      setAnimalClass(result)
    } catch (error) {
      console.error('Error classifying animal:', error)
      alert('Error classifying animal. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
            AI Bootcamp Week 5
          </div>
          <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
            Upload an Animal Image
          </h1>
          <p className="mt-2 text-gray-500">
            Please upload a picture of an animal. Our AI will analyze it and provide information about the animal.
          </p>
          <div className="mt-4">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
              Choose an image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
            />
          </div>
          {preview && (
            <div className="mt-4">
              <Image
                src={preview}
                alt="Uploaded animal"
                width={300}
                height={300}
                className="rounded-lg object-cover"
                ref={imageRef}
              />
            </div>
          )}
          <div className="mt-4">
            <Button 
              onClick={handleUpload} 
              disabled={!image || isUploading}
              className="w-full"
            >
              {isUploading ? 'Classifying...' : 'Classify Animal'}
            </Button>
          </div>
          {animalClass && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <p className="text-green-800">
                Detected animal: <strong>{animalClass}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

