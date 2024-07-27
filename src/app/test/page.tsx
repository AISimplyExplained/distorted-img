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
  const [kaleidoscopeImg, setKaleidoscopeImg] = useState<string | null>(null);
  const [segmentCount, setSegmentCount] = useState<number>(6);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/opencv.js"; // Make sure to place opencv.js in your public folder
    script.async = true;
    script.onload = () => {
      cv.onRuntimeInitialized = () => {
        console.log("OpenCV.js is ready");
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

  const handleSegmentCountChange = (value: number[]) => {
    setSegmentCount(value[0]);
  };

  // @ts-ignore
  const createKaleidoscope = (src: cv.Mat, segments: number = 6): cv.Mat => {
    const rows = src.rows;
    const cols = src.cols;
    const center = new cv.Point(Math.floor(cols / 2), Math.floor(rows / 2));
// Create a mask for one segment
    const mask = new cv.Mat(rows, cols, cv.CV_8UC1, new cv.Scalar(0));
    const trianglePoints = [
      center,
      new cv.Point(cols, 0),
      new cv.Point(cols, rows),
    ];
//@ts-ignore
    const triangle = cv.matFromArray(trianglePoints.length, 1, cv.CV_32SC2, trianglePoints);
    cv.fillConvexPoly(mask, triangle, new cv.Scalar(255));

    // Create the kaleidoscope effect
    const result = new cv.Mat(rows, cols, src.type(), new cv.Scalar(0, 0, 0, 255));
    const M = new cv.Mat();
    const stepAngle = 360 / segments;

    for (let i = 0; i < segments; i++) {
      const rotated = new cv.Mat();
      const M = cv.getRotationMatrix2D(center, i * stepAngle, 1.0);
      cv.warpAffine(src, rotated, M, new cv.Size(cols, rows));

      const segmentResult = new cv.Mat();
      cv.bitwise_and(rotated, rotated, segmentResult, mask);
      cv.add(result, segmentResult, result);

      rotated.delete();
      segmentResult.delete();
      M.delete();
    }

    mask.delete();
    M.delete();

    return result;
  };

  const applyKaleidoscope = async () => {
    if (!image || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      ctx.drawImage(img, 0, 0);

      const src = cv.imread(canvasRef.current!);
      const dst = createKaleidoscope(src, segmentCount);

      cv.imshow(canvasRef.current!, dst);
      const kaleidoscopeImageDataUrl = canvasRef.current!.toDataURL();

      setKaleidoscopeImg(kaleidoscopeImageDataUrl);

      src.delete();
      dst.delete();
    };
    img.src = URL.createObjectURL(image);
  };
return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-4xl w-full px-4 md:px-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Kaleidoscope Effect</CardTitle>
            <CardDescription>
              Upload an image and apply a kaleidoscope effect
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
                <Label htmlFor="segment-count">Segment Count</Label>
                <Slider
                  id="segment-count"
                  min={2}
                  max={12}
                  step={1}
                  value={[segmentCount]}
                  onValueChange={handleSegmentCountChange}
                />
              </div>
            </div>
            <Button onClick={applyKaleidoscope}>Apply Kaleidoscope</Button>
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
{kaleidoscopeImg ? (
            <div className="relative w-full h-full mb-8">
              <img
                src={kaleidoscopeImg}
                alt="Kaleidoscope Image"
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
              <h2 className="text-center mt-4">Kaleidoscope Image</h2>
            </div>
          ) : (
            <div className="relative w-full h-full"> </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
