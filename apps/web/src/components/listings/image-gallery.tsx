'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface ImageGalleryProps {
  images: { url: string; thumbnailUrl?: string; altText?: string }[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-text-secondary">No images available</p>
      </div>
    );
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden group">
          <Image
            src={images[activeIndex]?.url || '/placeholder-vehicle.jpg'}
            alt={images[activeIndex]?.altText || title}
            fill
            className="object-cover"
            priority
          />

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <Expand className="w-4 h-4" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                  i === activeIndex ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.thumbnailUrl || img.url}
                  alt={img.altText || `${title} ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={images[activeIndex]?.url || '/placeholder-vehicle.jpg'}
              alt={images[activeIndex]?.altText || title}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
