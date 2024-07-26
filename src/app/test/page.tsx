"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import cv from "opencv-ts";

export default function Component(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [refractImg, setRefractImg] = useState<string | null>(null);
  const [refractionCount, setRefractionCount] = useState<number>(3);
  const [refractionFocus, setRefractionFocus] = useState<number>(0.5);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/opencv.js'; // Make sure to place opencv.js in your public folder
    script.async = true;
    script.onload = () => {
      cv.onRuntimeInitialized = () => {
        console.log('OpenCV.js is ready');
      };
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const blobUrl = URL.createObjectURL(file);
      setImage(file);
      setImageUrl(blobUrl);
    }
  };

  const handleRefractionCountChange = (value: number[]) => {
    setRefractionCount(value[0]);
  };

  const handleRefractionFocusChange = (value: number[]) => {
    setRefractionFocus(value[0]);
  };

  //@ts-ignore
  const createDistortionMap = (image: cv.Mat, refractionCount: number, refractionFocus: number) => {
    const rows = image.rows;
    const cols = image.cols;
    const mapX = new cv.Mat(rows, cols, cv.CV_32FC1);
    const mapY = new cv.Mat(rows, cols, cv.CV_32FC1);

    const sectionSize = Math.floor(Math.min(rows, cols) / (refractionCount * 0.1));
    const centerX = cols / 2;
    const centerY = rows / 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const r = distance * (1 - refractionFocus) + 
                  (Math.random() * sectionSize) * refractionFocus;
        const theta = angle + (Math.random() * Math.PI * 2 - Math.PI) * refractionFocus;

        const srcX = (centerX + r * Math.cos(theta) + cols) % cols;
        const srcY = (centerY + r * Math.sin(theta) + rows) % rows;

        mapX.floatPtr(y, x)[0] = srcX;
        mapY.floatPtr(y, x)[0] = srcY;
      }
    }

    return [mapX, mapY];
  };

  const applyDistortion = async () => {
    if (!image || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      ctx.drawImage(img, 0, 0);

      const src = cv.imread(canvasRef.current!);
      const dst = new cv.Mat();

      const [mapX, mapY] = createDistortionMap(src, refractionCount, refractionFocus * 0.1);

      cv.remap(src, dst, mapX, mapY, cv.INTER_LINEAR, cv.BORDER_WRAP);

      cv.imshow(canvasRef.current!, dst);
      const distortedImageDataUrl = canvasRef.current!.toDataURL();

      setRefractImg(distortedImageDataUrl);

      src.delete();
      dst.delete();
      mapX.delete();
      mapY.delete();
    };
    img.src = URL.createObjectURL(image);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-4xl w-full px-4 md:px-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Image Effects</CardTitle>
            <CardDescription>
              Upload an image and apply various effects
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-xl">
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refraction-count">Refraction Count</Label>
                <Slider
                  id="refraction-count"
                  min={1}
                  max={10}
                  step={1}
                  value={[refractionCount]}
                  onValueChange={handleRefractionCountChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refraction-focus">Refraction Focus</Label>
                <Slider
                  id="refraction-focus"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[refractionFocus]}
                  onValueChange={handleRefractionFocusChange}
                />
              </div>
            </div>
            <Button onClick={applyDistortion}>Apply Effect</Button>
          </CardContent>
        </Card>
        <div className="flex justify-center items-center gap-4 mt-4 relative">
          {imageUrl && (
            <div className="relative w-full h-full mb-8">
              <img
                src={imageUrl}
                alt="Uploaded Image"
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
              <h2 className="text-center mt-4">Original Image</h2>
            </div>
          )}
          {refractImg && (
            <div className="relative w-full h-full mb-8">
              <img
                src={refractImg}
                alt="Distorted Image"
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
              <h2 className="text-center mt-4">Distorted Image</h2>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}