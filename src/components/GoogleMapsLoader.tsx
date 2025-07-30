import React, { useEffect, useState } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapsLoaderProps {
  children?: React.ReactNode;
}

export const GoogleMapsLoader = ({ children }: GoogleMapsLoaderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Kiểm tra xem Google Maps API đã được load chưa
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Kiểm tra API key
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=vi`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup nếu component unmount
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Hiển thị loading screen khi chưa load xong
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải Google Maps...</p>
        </div>
      </div>
    );
  }

  // Render children khi đã load xong
  return <>{children}</>;
}; 