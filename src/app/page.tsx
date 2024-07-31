"use client"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import imageCompression from 'browser-image-compression';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [diamondSize, setDiamondSize] = useState<number>(0.5);
  const [edgeSoftness, setEdgeSoftness] = useState<number>(20);
  const [rotation, setRotation] = useState<number>(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        setSelectedFile(compressedFile);
        setResultImage(null);
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('Failed to compress the image. Please try again.');
      }
    }
  };

  const handleDiamondSizeChange = (value: number[]) => {
    setDiamondSize(value[0]);
  };

  const handleEdgeSoftnessChange = (value: number[]) => {
    setEdgeSoftness(value[0]);
  };

  const handleRotationChange = (value: number[]) => {
    setRotation(value[0]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('diamond_size', diamondSize.toString());
    formData.append('edge_softness', edgeSoftness.toString());
    formData.append('rotation', rotation.toString());

    try {
      setLoading(true);
      setError(null);

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
      setError('Failed to process the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'processed_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <div className="max-w-4xl w-full p-8 bg-card rounded-lg">
        <div className="flex items-center mb-6">
          <img src="/dlogo.png" alt="DDD Refraction Tool Logo" className="h-12 mr-4" />
          <h1 className="text-3xl font-bold text-card-foreground">DDD Refraction Tool</h1>
        </div>

        <p className="text-lg mb-6 text-card-foreground">
          Transform your images into stunning, refracted works of art perfect for enhancing your slide decks and presentations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Upload an Image</h2>
              {!selectedFile && !resultImage && (
                <div className="flex flex-col items-center justify-center w-full aspect-square bg-muted rounded-lg p-4 border-2 border-dashed border-muted-foreground">
                  <div className="w-12 h-12 text-muted-foreground mb-4">
                    {/* You can add an upload icon here */}
                  </div>
                  <p className="text-center text-muted-foreground">Drag and drop an image or click to upload</p>
                </div>
              )}
              {selectedFile && !resultImage && (
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Uploaded Image"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-center"
                >
                  Upload Image
                </label>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            {resultImage && (
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Result Image</h2>
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                  <img
                    src={resultImage}
                    alt="Processed Image"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Download Image
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="diamond_size" className="flex justify-between text-lg mb-2">
                Diamond Size
                <span className="text-sm text-muted-foreground">{diamondSize.toFixed(1)}</span>
              </Label>
              <Slider
                id="diamond_size"
                min={0.1}
                max={1}
                step={0.1}
                value={[diamondSize]}
                onValueChange={handleDiamondSizeChange}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Control the size of the diamond shapes applied to your image. Range: 0.1 (small) to 1.0 (large).
              </p>
            </div>

            <div>
              <Label htmlFor="edge_softness" className="flex justify-between text-lg mb-2">
                Edge Softness
                <span className="text-sm text-muted-foreground">{edgeSoftness}</span>
              </Label>
              <Slider
                id="edge_softness"
                min={0}
                max={100}
                step={5}
                value={[edgeSoftness]}
                onValueChange={handleEdgeSoftnessChange}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Control the transition between the refracted and non-refracted areas of the image. Range: 0 (sharp edges) to 100 (soft edges).
              </p>
            </div>

            <div>
              <Label htmlFor="rotation" className="flex justify-between text-lg mb-2">
                Rotation (degrees)
                <span className="text-sm text-muted-foreground">{rotation}°</span>
              </Label>
              <Slider
                id="rotation"
                min={0}
                max={360}
                step={15}
                value={[rotation]}
                onValueChange={handleRotationChange}
                className="[&>span:first-child]:h-2 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Rotate the refracted pattern to suit your artistic vision. Range: 0° to 360°.
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Processing..." : "Apply Refraction Effect"}
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