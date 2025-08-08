// components/roomdetail/SearchableGoogleMap.tsx
import React, { useState } from "react";

interface SearchableGoogleMapProps {
  lat: number;
  lng: number;
}

export default function SearchableGoogleMap({
  lat,
  lng,
}: SearchableGoogleMapProps) {
  const [input, setInput] = useState(`${lat}, ${lng}`);
  const [query, setQuery] = useState(input);

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input);
  };

  return (
    <div className="space-y-6">
      {/* Form tìm kiếm */}

      {/* Bản đồ nhúng */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
        <iframe
          title="Google Map"
          src={mapSrc}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
