"use client"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Download, Upload, X } from "lucide-react";
import imageCompression from 'browser-image-compression';

const RefractorTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [diamondSize, setDiamondSize] = useState<number>(0.5);
  const [edgeSoftness, setEdgeSoftness] = useState<number>(20);
  const [rotation, setRotation] = useState<number>(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        setPreviewImage(URL.createObjectURL(compressedFile));
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

  const removeImage = (): void => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-4">
          <img
            src="dlogo.png"
            alt="Logo Creator"
            className="w-16 h-16 object-contain"
          />
          <CardTitle className="text-2xl font-bold">
            Refractor Tool
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        {/* File upload section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Upload an Image</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4 max-w-md">
              <p className="text-sm">
                Drag and drop or click to upload an image to apply the refraction effect.
              </p>
              <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={removeImage}
                      className="absolute top-2 right-2 z-10 rounded-full bg-background border border-input h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Camera className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-sm"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
              <Input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {resultImage && (
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Result Image</h3>
                <div className="relative w-full h-40 overflow-hidden rounded-lg">
                  <img
                    src={resultImage}
                    alt="Processed Image"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  className="w-full text-sm"
                >
                  <Download className="mr-2 h-4 w-4" /> Download Image
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sliders section */}
        <div className="space-y-6 mb-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="diamond_size" className="text-sm font-medium">
                Diamond Size
              </Label>
              <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                {diamondSize.toFixed(1)}
              </span>
            </div>
            <Slider
              id="diamond_size"
              min={0.1}
              max={1}
              step={0.1}
              value={[diamondSize]}
              onValueChange={handleDiamondSizeChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Control the size of the diamond shapes applied to your image. Range: 0.1 (small) to 1.0 (large).
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="edge_softness" className="text-sm font-medium">
                Edge Softness
              </Label>
              <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                {edgeSoftness}
              </span>
            </div>
            <Slider
              id="edge_softness"
              min={0}
              max={100}
              step={5}
              value={[edgeSoftness]}
              onValueChange={handleEdgeSoftnessChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Control the transition between the refracted and non-refracted areas of the image. Range: 0 (sharp edges) to 100 (soft edges).
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="rotation" className="text-sm font-medium">
                Rotation (degrees)
              </Label>
              <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                {rotation}°
              </span>
            </div>
            <Slider
              id="rotation"
              min={0}
              max={360}
              step={15}
              value={[rotation]}
              onValueChange={handleRotationChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Rotate the refracted pattern to suit your artistic vision. Range: 0° to 360°.
            </p>
          </div>
        </div>

        {/* Apply effect button */}
        <div className="flex justify-center">
          <Button
            className="px-8 py-4 text-lg font-semibold"
            disabled={!selectedFile || loading}
            onClick={handleSubmit}
          >
            {loading ? "Processing..." : "Apply Refraction Effect"}
          </Button>
        </div>

        {error && (
          <div className="mt-6 text-red-500">
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RefractorTool;