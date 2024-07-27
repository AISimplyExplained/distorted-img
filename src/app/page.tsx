"use client"
import React, { useState } from 'react';
import {processImageFn} from "@/lib/processImage"

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64Image = reader.result?.toString().split(',')[1];
      if (base64Image) {
        try {
          const result = await processImageFn(base64Image, 0.5, 20);
          setProcessedImage(`data:image/png;base64,${result}`);
        } catch (error) {
          console.error('Image processing failed', error);
        }
      }
    };
  };

  return (
    <div>
      <h1>Diamond Reflection Effect</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Process Image</button>
      {processedImage && <img src={processedImage} alt="Processed" />}
    </div>
  );
};

export default Home;
