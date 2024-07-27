"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function Component() {
  const [image, setImage] = useState<File | null>(null);
  const [refraction, setRefraction] = useState<number>(0.5);
  const [refractionFocus, setRefractionFocus] = useState<number>(0.5);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(event.target.files[0]);
    }
  };

  const handleRefractionChange = (value: number[]) => {
    setRefraction(value[0]);
  };

  const handleRefractionFocusChange = (value: number[]) => {
    setRefractionFocus(value[0]);
  };

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('diamond_size', refraction.toString());
    formData.append('edge_softness', refractionFocus.toString());

    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-2xl w-full p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-card-foreground">Image Effects</h1>

        <div className="flex flex-col gap-4 mt-6 md:flex-row">
          {image && !resultImage && (
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Original Image</h2>
              <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                <img
                  src={URL.createObjectURL(image)}
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

          {!image && !resultImage && (
            <div className="flex flex-col items-center justify-center w-full aspect-square bg-muted rounded-lg">
              <div className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Drag and drop an image or click to upload</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="refraction">Diamond Size</Label>
            <Slider
              id="refraction"
              min={0}
              max={1}
              step={0.01}
              value={[refraction]}
              onValueChange={handleRefractionChange}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
            />
          </div>
          <div>
            <Label htmlFor="refractionFocus">Edge Softness</Label>
            <Slider
              id="refractionFocus"
              min={0}
              max={1}
              step={0.01}
              value={[refractionFocus]}
              onValueChange={handleRefractionFocusChange}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <label
            htmlFor="image-upload"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <div className="w-5 h-5 mr-2" />
            Upload Image
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {image && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}