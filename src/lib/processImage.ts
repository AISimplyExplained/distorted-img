export function processImageFn(image: string, diamondSize = 0.5, edgeSoftness = 20): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/png;base64,${image}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Canvas context is not available'));
      }

      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;

      // Enable willReadFrequently for better performance with frequent getImageData calls
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const centerX = width / 2;
      const centerY = height / 2;

      // Create diamond mask
      const mask = ctx.createImageData(width, height);
      const maskData = mask.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = Math.abs(x - centerX) / (width * diamondSize);
          const dy = Math.abs(y - centerY) / (height * diamondSize);
          const alpha = dx + dy < 1 ? 255 : 0;

          const index = (y * width + x) * 4;
          maskData[index] = alpha; // R
          maskData[index + 1] = alpha; // G
          maskData[index + 2] = alpha; // B
          maskData[index + 3] = alpha; // A
        }
      }

      ctx.putImageData(mask, 0, 0);

      // Apply blur effect
      ctx.filter = `blur(${edgeSoftness}px)`;
      ctx.drawImage(canvas, 0, 0);

      // Create final image
      const finalImageData = ctx.getImageData(0, 0, width, height);
      ctx.putImageData(finalImageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result?.toString().split(',')[1] || '');
          };
          reader.readAsDataURL(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    };
    img.onerror = reject;
  });
}
