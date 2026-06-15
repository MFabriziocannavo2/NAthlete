export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

/** Loads a File/Blob/URL into an HTMLImageElement. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

/**
 * Renders the cropped area of an image onto a square canvas and returns it as a Blob.
 * Used to bake the athlete's chosen crop/zoom/position into the uploaded avatar.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: CropArea,
  outputSize = 512,
  mimeType = "image/jpeg",
  quality = 0.9
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement("canvas")
  canvas.width = outputSize
  canvas.height = outputSize

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create image"))),
      mimeType,
      quality
    )
  })
}

/**
 * Resizes/recompresses an image file until it fits within `maxBytes`.
 * Returns the original file unchanged if it's already small enough.
 */
export async function compressImageFile(
  file: File,
  maxBytes: number,
  maxDimension = 2048
): Promise<File> {
  if (file.size <= maxBytes) return file

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const image = await loadImage(dataUrl)

  let { width, height } = image
  const scale = Math.min(1, maxDimension / Math.max(width, height))
  width = Math.round(width * scale)
  height = Math.round(height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file

  ctx.drawImage(image, 0, 0, width, height)

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg"

  let quality = 0.9
  let blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, mimeType, quality)
  )

  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1
    blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
  }

  if (!blob || blob.size > maxBytes) return file

  const ext = mimeType === "image/png" ? "png" : "jpg"
  const newName = file.name.replace(/\.[^.]+$/, "") + `.${ext}`
  return new File([blob], newName, { type: mimeType })
}
