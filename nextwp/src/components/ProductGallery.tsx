"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  width: string;
  height: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
  isZoomed: boolean;
  onZoomToggle: (zoomed: boolean) => void;
  isOnSale: boolean;
  discountPercentage: number;
}

export default function ProductGallery({
  images,
  selectedImageIndex,
  onImageSelect,
  isZoomed,
  onZoomToggle,
  isOnSale,
  discountPercentage
}: ProductGalleryProps) {
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const visibleThumbnails = 4;

  const handlePreviousImage = () => {
    const newIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
    onImageSelect(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1;
    onImageSelect(newIndex);
  };

  const handleThumbnailScroll = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
    } else {
      const maxStart = Math.max(0, images.length - visibleThumbnails);
      setThumbnailStartIndex(Math.min(maxStart, thumbnailStartIndex + 1));
    }
  };

  const visibleThumbnailsSlice = images.slice(
    thumbnailStartIndex,
    thumbnailStartIndex + visibleThumbnails
  );

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden group">
        <Image
          src={images[selectedImageIndex]?.src || '/api/placeholder/600/600'}
          alt={images[selectedImageIndex]?.alt || 'Product image'}
          fill
          className={`object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          quality={95}
          priority
        />

        {/* Sale Badge */}
        {isOnSale && discountPercentage > 0 && (
          <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 z-10">
            {discountPercentage}% OFF
          </Badge>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onZoomToggle(!isZoomed)}
          className="absolute bottom-4 right-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
        </Button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="relative">
          {/* Previous Thumbnail Button */}
          {thumbnailStartIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleThumbnailScroll('prev')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md z-10"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}

          {/* Next Thumbnail Button */}
          {thumbnailStartIndex + visibleThumbnails < images.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleThumbnailScroll('next')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md z-10"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}

          {/* Thumbnail Grid */}
          <div className="flex justify-center gap-2 px-8">
            {visibleThumbnailsSlice.map((image, index) => {
              const actualIndex = thumbnailStartIndex + index;
              const isSelected = actualIndex === selectedImageIndex;
              
              return (
                <button
                  key={image.id}
                  onClick={() => onImageSelect(actualIndex)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                    isSelected 
                      ? 'border-purple-600 scale-105 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                  }`}
                >
                  <Image
                    src={image.src || '/api/placeholder/80/80'}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={75}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-600/20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
