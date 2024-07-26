"use client";

import { useState, ChangeEvent } from "react";
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

export default function Component(): JSX.Element {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl]= useState<string | null>(null);
  const [refractImg, setRefractImg] = useState<string | null>(null);
  const [refractionCount, setRefractionCount] = useState<number>(3);
  const [refractionFocus, setRefractionFocus] = useState<number>(0.5);

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
              <Button>Click</Button>
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
                style={{
                  filter: `refract(${refractionCount}, ${refractionFocus})`,
                }}
              />
              <h2 className="text-center mt-4">Original Image</h2>
            </div>
          )}
          {refractImg ? (
            <div className="relative w-full h-full">
              <img
                src={"/next.svg"}
                alt="Uploaded Image"
                width={500}
                height={500}
                className="w-full h-full object-contain"
                style={{
                  filter: `refract(${refractionCount}, ${refractionFocus})`,
                }}
              />
              <h2 className="text-center mt-4">Distorted Image</h2>
            </div>
          ) : (
            <div className="relative w-full h-full"> </div>
          )}
        </div>
      </div>
    </div>
  );
}
