'use client';

import { useState } from 'react';
import { processImage } from './actions/processImage';

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
      'use server'
      const base64Image = reader.result?.toString().split(',')[1];
      if (base64Image) {
        try {
          const result = await useServerAction(processImage, {
            image: base64Image,
            diamondSize: 0.5,
            edgeSoftness: 20,
          });
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
