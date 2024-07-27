import sharp from 'sharp';

interface ProcessImageParams {
  image: string;
  diamondSize?: number;
  edgeSoftness?: number;
}

export async function processImage({ image, diamondSize = 0.5, edgeSoftness = 20 }: ProcessImageParams) {
  try {
    const imgBuffer = Buffer.from(image, 'base64');
    const img = sharp(imgBuffer);
    const { width, height } = await img.metadata();

    if (!width || !height) {
      throw new Error('Invalid image dimensions');
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const diamondMask = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = Math.abs(x - centerX) / (width * diamondSize);
        const dy = Math.abs(y - centerY) / (height * diamondSize);
        diamondMask[y * width + x] = dx + dy < 1 ? 255 : 0;
      }
    }

    const maskBuffer = Buffer.from(diamondMask);
    const maskImage = sharp(maskBuffer, {
      raw: {
        width: width,
        height: height,
        channels: 1,
      },
    }).blur(edgeSoftness);

    const imgArray = await img.raw().toBuffer();
    const maskArray = await maskImage.raw().toBuffer();
    const resultArray = Buffer.alloc(imgArray.length);

    for (let i = 0; i < imgArray.length; i += 4) {
      const alpha = maskArray[i / 4] / 255;
      resultArray[i] = imgArray[i] * alpha + imgArray[imgArray.length - i - 4] * (1 - alpha);
      resultArray[i + 1] = imgArray[i + 1] * alpha + imgArray[imgArray.length - i - 3] * (1 - alpha);
      resultArray[i + 2] = imgArray[i + 2] * alpha + imgArray[imgArray.length - i - 2] * (1 - alpha);
      resultArray[i + 3] = imgArray[i + 3];
    }

    const outputImage = await sharp(resultArray, {
      raw: {
        width: width,
        height: height,
        channels: 4,
      },
    })
      .toFormat('png')
      .toBuffer();

    return outputImage.toString('base64');
  } catch (error) {
    console.error(error);
    throw new Error('Image processing failed');
  }
}
