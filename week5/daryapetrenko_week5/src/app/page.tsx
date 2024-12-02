"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

const ImageUploadPage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [dangerStatus, setDangerStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      const base64Image = await fileToBase64(selectedImage);
      formData.append("userImage", base64Image);

      const response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.description && result.dangerStatus) {
        setDescription(result.description);
        setDangerStatus(result.dangerStatus);
      } else {
        setError("Unexpected response format. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8 w-full">
          <h1 className="text-2xl font-bold text-green-900 mb-6 text-center uppercase">
            ZooLens: Animal Identifier
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="image-upload"
                className="block text-sm font-medium text-gray-700 text-center"
              >
                Upload Animal Image
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={(e) =>
                  setSelectedImage(e.target.files ? e.target.files[0] : null)
                }
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>

            {selectedImage && (
              <div className="mt-2 flex justify-center">
                <Image
                  src={URL.createObjectURL(selectedImage)}
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
              className="mt-4 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium bg-green-800 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  Processing...
                </>
              ) : (
                "Process Image"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-8 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {description && dangerStatus && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-green-900 mb-2 text-center uppercase">
                Animal Description
              </h2>
              <p>{description}</p>
              <h2 className="text-lg font-semibold text-red-900 mb-2 text-center uppercase">
                Danger Status
              </h2>
              <p>{dangerStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPage;
