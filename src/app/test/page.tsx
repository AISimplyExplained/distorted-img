"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [diamondSize, setDiamondSize] = useState<number>(0.5); // Default value in range 0.1 to 0.9
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added error state

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDiamondSizeChange = (value: number[]) => {
    setDiamondSize(value[0]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('diamond_size', diamondSize.toString()); // Convert to string for form data

    try {
      setLoading(true);
      setError(null); // Reset error state

      const response = await fetch('https://python-api-9iam.onrender.com/diamond_reflection_effect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setResultImage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to process the image. Please try again.'); // Set error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-2xl w-full p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-card-foreground">Diamond Reflection Effect</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 md:flex-row">
            {selectedFile && !resultImage && (
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Original Image</h2>
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Uploaded Image"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {resultImage && (
              <div className="flex-1 mt-4 md:mt-0">
                <h2 className="text-lg font-semibold mb-2">Result Image</h2>
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  <img
                    src={resultImage}
                    alt="Processed Image"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {!selectedFile && !resultImage && (
            <div className="flex flex-col items-center justify-center w-full aspect-square bg-muted rounded-lg">
              <div className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Drag and drop an image or click to upload</p>
            </div>
          )}

          <div className="mt-6">
            <Label htmlFor="diamond_size">Diamond Size</Label>
            <Slider
              id="diamond_size"
              min={0.1} // Updated minimum value
              max={0.9} // Updated maximum value
              step={0.1} // Adjusted step for floating point values
              value={[diamondSize]}
              onValueChange={handleDiamondSizeChange}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <label
              htmlFor="image-upload"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <div className="w-5 h-5 mr-2" />
              Upload Image
            </label>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {selectedFile && (
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-6 text-red-500">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;