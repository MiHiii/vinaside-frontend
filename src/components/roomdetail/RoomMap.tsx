// components/roomdetail/SearchableGoogleMap.tsx
import React, { useState } from "react";
import { Search } from "lucide-react";

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
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="
              w-full max-w-md
              pl-12 pr-4 py-2
              bg-gray-100
              rounded-full
              focus:outline-none focus:ring-2 focus:ring-black
              transition
            "
            placeholder="Nhập địa chỉ hoặc tên địa điểm…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="
            px-6 py-2
            bg-gray-600 text-white
            rounded-full
            hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-black
            transition
          "
        >
          Tìm
        </button>
      </form>

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
