import React, { useState } from 'react';
import { Box, Button, Input, Text, Image, Stack, Heading, useBreakpointValue } from '@chakra-ui/react';
import axios from 'axios';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [animalInfo, setAnimalInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setAnimalInfo(null); // Clear previous animal info
    setIsProcessing(false); // Reset processing state to false
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post('/api/upload', formData);
      const { animal_detected, animal_name, dangerous, confidence, wiki_info } = response.data;

      setAnimalInfo({
        animal_detected: animal_detected,
        animal_name: animal_name,
        dangerous: dangerous,
        confidence: confidence,
        wiki_info: wiki_info,
      });

      // Keep the selected image until a new file is selected
    } catch (error) {
      console.error('Error uploading image:', error);
      setAnimalInfo({ message: 'Error processing the image. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box 
      maxW="600px" 
      mx="auto" 
      mt="50px" 
      p="20px" 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="lg" 
      bg="white"
    >
      <Stack spacing={4} textAlign="center">
        <Heading fontSize={useBreakpointValue({ base: '2xl', md: '3xl' })} color="teal.600">Animal Classifier</Heading>
        <Text fontSize="lg" color="gray.600">Select your image and click "Upload"</Text>
      </Stack>

      <Box textAlign="center" mb="5" mt="4">
        <Button 
          as="label" 
          htmlFor="file-upload" 
          colorScheme="teal" 
          w="50%" 
          mb={3}
        >
          {selectedImage ? 'Select File' : 'Select File'}
        </Button>
        <Input 
          id="file-upload" 
          type="file" 
          onChange={handleImageChange} 
          size="md" 
          display="none" // Hide the default input
        />
        {selectedImage && (
          <Image
            src={URL.createObjectURL(selectedImage)}
            alt="Selected Image"
            maxH="300px"
            mx="auto"
            mb="5"
            objectFit="cover"
            borderRadius="md"
            boxShadow="md"
          />
        )}
        <Button 
          colorScheme="teal" 
          onClick={handleUpload} 
          w="100%" 
          isLoading={isProcessing}
          loadingText="Uploading"
        >
          Upload
        </Button>
      </Box>

      {isProcessing && <Text textAlign="center">Processing file...</Text>}

      {animalInfo && (
        <Box mt="5" textAlign="center" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" bg="gray.50">
          {animalInfo.animal_detected ? (
            <>
              <Text fontSize="xl" fontWeight="bold" color="teal.600">Animal Detected: {animalInfo.animal_name}</Text>
              <Text fontSize="md" color="gray.700">Confidence: {(animalInfo.confidence * 100).toFixed(2)}%</Text>
              <Text fontSize="md" color="gray.700">Dangerous: {animalInfo.dangerous ? 'Yes' : 'No'}</Text>
              <Text mt="3" color="gray.600">{animalInfo.wiki_info}</Text>
            </>
          ) : (
            <Text fontSize="md" color="red.500">This doesn't seem to be an animal or is not in our animal list.</Text>
          )}
        </Box>
      )}
    </Box>
  );
}


