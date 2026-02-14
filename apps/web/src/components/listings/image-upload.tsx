'use client';

import { useState, useCallback } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 20 }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const remaining = maxImages - images.length;
    const filesToAdd = newFiles.slice(0, remaining);

    if (filesToAdd.length === 0) return;

    // Create previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    onImagesChange([...images, ...filesToAdd]);
  }, [images, maxImages, onImagesChange]);

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = 'image/*';
          input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
          input.click();
        }}
      >
        <Upload className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-text-secondary mt-1">
          PNG, JPG, WebP up to 10MB each. Max {maxImages} images.
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {images.length}/{maxImages} uploaded
        </p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-border group"
            >
              <img src={preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
