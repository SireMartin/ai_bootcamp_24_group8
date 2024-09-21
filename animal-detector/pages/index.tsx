import { useState } from 'react';
import { Input, Button, Box, Text, Image, Alert, AlertIcon, VStack, Heading } from '@chakra-ui/react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setClassificationResult(null);
    setIsProcessing(true);

    try {
      const response = await axios.post('/api/upload', formData);
      setClassificationResult(response.data.message);
    } catch (error) {
      console.error('Error uploading file:', error);
      setClassificationResult('Error processing the image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box 
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      backgroundColor="gray.100"
    >
      <Box 
        p={5} 
        borderWidth={1} 
        borderRadius="md" 
        boxShadow="lg" 
        bg="white" 
        maxW="md" 
        w="100%"
      >
        <Heading as="h1" size="xl" mb={2} textAlign="center" fontFamily="Arial, sans-serif">Animal Classifier</Heading>
        <Text textAlign="center" mb={4} fontSize="lg" color="gray.600">
          Select your image and click "Upload"
        </Text>
        
        {/* Custom Browse Button */}
        <Box mb={4} textAlign="center">
          <Input
            type="file"
            onChange={handleFileChange}
            display="none"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button
              colorScheme="teal"
              size="lg"
              as="span"
              mb={4}
            >
              Browse
            </Button>
          </label>
        </Box>

        <Button
          colorScheme="teal"
          size="lg"
          onClick={handleUpload}
          w="100%"
          mb={4}
        >
          Upload
        </Button>
        
        {uploadedImageUrl && (
          <Box mb={4} textAlign="center">
            <Text mb={2}>Selected Image:</Text>
            <Image src={uploadedImageUrl} alt="Selected Image" borderRadius="md" mx="auto" />
          </Box>
        )}

        {isProcessing && (
          <Text fontSize="lg" textAlign="center" color="blue.500">Processing file...</Text>
        )}

        {classificationResult && (
          <Alert status="info" mt={4} borderRadius="md">
            <AlertIcon />
            <Text>{classificationResult}</Text>
          </Alert>
        )}
      </Box>
    </Box>
  );
}

