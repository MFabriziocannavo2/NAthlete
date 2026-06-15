"use client"

import { useCallback, useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import Button from "@/components/ui/Button"
import { getCroppedImageBlob } from "@/lib/imageProcessing"

export default function ImageCropModal({
  imageSrc,
  onCancel,
  onSave,
}: {
  imageSrc: string
  onCancel: () => void
  onSave: (blob: Blob) => void
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedArea) return
    setSaving(true)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedArea)
      onSave(blob)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-4 sm:p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Adjust your photo</h2>

        <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-black touch-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-orange-500"
            aria-label="Zoom"
          />
        </div>

        <p className="text-xs text-gray-500 text-center">
          Drag to reposition, pinch or use the slider to zoom.
        </p>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
