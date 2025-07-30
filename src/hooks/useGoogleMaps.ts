import { useEffect, useState } from 'react';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Kiểm tra ngay lập tức
    if (checkGoogleMaps()) {
      return;
    }

    // Nếu chưa có, poll mỗi 100ms
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return isLoaded;
}; 