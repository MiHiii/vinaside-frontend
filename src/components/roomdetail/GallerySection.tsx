import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";

interface GallerySectionProps {
  images?: string[];
  title?: string;
}

const GallerySection: React.FC<GallerySectionProps> = ({ 
  images = [], 
  title = "Room Gallery" 
}) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});

  // Default images if none provided
  const defaultImages = [
    "https://a0.muscache.com/im/pictures/miso/Hosting-1130252017647465707/original/76bfd955-aa96-42ec-86ca-b4ab542f2841.jpeg?im_w=1200",
    "https://picsum.photos/800/600?random=1",
    "https://picsum.photos/800/600?random=2", 
    "https://picsum.photos/800/600?random=3",
    "https://picsum.photos/800/600?random=4",
    "https://picsum.photos/800/600?random=5",
    "https://picsum.photos/800/600?random=6",
    "https://picsum.photos/800/600?random=7",
  ];

  const galleryImages = images.length > 0 ? images : defaultImages;
  const mainImage = galleryImages[0];
  const subImages = galleryImages.slice(1, 5);
  const totalImages = galleryImages.length;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
  };

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="relative">
        {/* Mobile: Single image with indicator */}
        <div className="block md:hidden">
          <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
            <img
              src={mainImage}
              alt="Room main view"
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => openLightbox(0)}
              onLoadStart={() => handleImageLoadStart(0)}
              onLoad={() => handleImageLoad(0)}
            />
            
            {imageLoading[0] && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              1 / {totalImages}
            </div>
            
            <Button
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 left-4 bg-white text-black hover:bg-gray-100"
              size="sm"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Xem tất cả ảnh
            </Button>
          </div>
        </div>

        {/* Desktop: Grid layout - FIXED: Đảm bảo ảnh fill đầy div */}
        <div className="hidden md:grid md:grid-cols-2 gap-2 h-[300px] lg:h-[400px] xl:h-[500px] overflow-hidden rounded-xl lg:rounded-2xl">
          {/* Main image - Left side */}
          <div className="relative w-full h-full group overflow-hidden">
            <img
              src={mainImage}
              alt="Main room view"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer group-hover:brightness-90 transition-all duration-300"
              onClick={() => openLightbox(0)}
              onLoadStart={() => handleImageLoadStart(0)}
              onLoad={() => handleImageLoad(0)}
            />
            
            {imageLoading[0] && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Sub images grid - Right side - FIXED: Absolute positioning cho images */}
          <div className="grid grid-cols-2 gap-2 h-full">
            {/* Top Left */}
            <div className="relative w-full h-full group overflow-hidden">
              <img
                src={subImages[0] || defaultImages[1]}
                alt="Room view 2"
                className="absolute inset-0 w-full h-full object-cover cursor-pointer group-hover:brightness-90 transition-all duration-300"
                onClick={() => openLightbox(1)}
                onLoadStart={() => handleImageLoadStart(1)}
                onLoad={() => handleImageLoad(1)}
              />
              {imageLoading[1] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Top Right */}
            <div className="relative w-full h-full group overflow-hidden">
              <img
                src={subImages[1] || defaultImages[2]}
                alt="Room view 3"
                className="absolute inset-0 w-full h-full object-cover cursor-pointer group-hover:brightness-90 transition-all duration-300"
                onClick={() => openLightbox(2)}
                onLoadStart={() => handleImageLoadStart(2)}
                onLoad={() => handleImageLoad(2)}
              />
              {imageLoading[2] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Bottom Left */}
            <div className="relative w-full h-full group overflow-hidden">
              <img
                src={subImages[2] || defaultImages[3]}
                alt="Room view 4"
                className="absolute inset-0 w-full h-full object-cover cursor-pointer group-hover:brightness-90 transition-all duration-300"
                onClick={() => openLightbox(3)}
                onLoadStart={() => handleImageLoadStart(3)}
                onLoad={() => handleImageLoad(3)}
              />
              {imageLoading[3] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Bottom Right */}
            <div className="relative w-full h-full group overflow-hidden">
              <img
                src={subImages[3] || defaultImages[4]}
                alt="Room view 5"
                className="absolute inset-0 w-full h-full object-cover cursor-pointer group-hover:brightness-90 transition-all duration-300"
                onClick={() => openLightbox(4)}
                onLoadStart={() => handleImageLoadStart(4)}
                onLoad={() => handleImageLoad(4)}
              />
              {imageLoading[4] && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Show more overlay on last image */}
              {totalImages > 5 && (
                <div 
                  className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-all duration-300 z-10"
                  onClick={() => openLightbox(4)}
                >
                  <div className="text-white text-center">
                    <Grid3X3 className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">
                      +{totalImages - 5} ảnh khác
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View all photos button - Desktop */}
        <Button
          onClick={() => openLightbox(0)}
          className="hidden md:flex absolute bottom-4 right-4 bg-white text-black hover:bg-gray-100 shadow-lg z-10"
          size="sm"
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Xem tất cả {totalImages} ảnh
        </Button>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Button
                  onClick={closeLightbox}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium">
                  {currentImageIndex + 1} / {totalImages}
                </span>
              </div>
              <h3 className="text-lg font-medium hidden sm:block">{title}</h3>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 pt-16 pb-20">
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Room view ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation Arrows */}
            {totalImages > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Strip - Desktop only */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
              {galleryImages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-white' 
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: Swipe indicators */}
          <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;