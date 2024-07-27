
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('diamond_size', '0.5'); // You can adjust these values or add inputs to change them
    formData.append('edge_softness', '20');

    try {
      setLoading(true);
      const response = await axios.post('https://python-api-9iam.onrender.com/diamond_reflection_effect', formData, {
        responseType: 'blob',
      });
      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);
      setResultImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Diamond Reflection Effect</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload and Process</button>
      </form>
      {loading && <p>Processing...</p>}
      {resultImage && (
        <div>
          <h2>Result Image:</h2>
          <img src={resultImage} alt="Processed" />
        </div>
      )}
    </div>
  );
};

export default Home;