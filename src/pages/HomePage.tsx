import * as React from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;
    const scrollAmount = 340;
    ref.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section title & scroll */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-card-foreground">
          Nơi lưu trú được ưa chuộng tại Hồ Chí Minh{" "}
          <span className="text-2xl">›</span>
        </h2>
        <div className="flex gap-2">
          <Button
            size="icon"
            className="rounded-full bg-muted hover:bg-muted/70"
            onClick={() => scroll(scrollContainerRef, "left")}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </Button>
          <Button
            size="icon"
            className="rounded-full bg-muted hover:bg-muted/70"
            onClick={() => scroll(scrollContainerRef, "right")}
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </div>

      {/* List cards horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {airbnbProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}

interface Property {
  id: string;
  name: string;
  price: string;
  nights: number;
  rating: number;
  image: string;
  isFavorite: boolean;
}

function PropertyCard({ property }: { property: Property }) {
  // Wishlist state giả lập
  const [liked, setLiked] = React.useState(property.isFavorite);

  return (
    <Card className="min-w-[280px] max-w-[280px] rounded-2xl bg-card border-none shadow hover:shadow-lg transition">
      <div className="relative">
        {/* Ảnh phòng */}
        <img
          src={property.image}
          alt={property.name}
          className="h-[220px] w-full object-cover rounded-2xl"
        />
        {/* Badge */}
        <Badge className="absolute top-3 left-3 bg-muted text-foreground font-medium rounded-xl shadow px-3 py-1 backdrop-blur">
          Được khách yêu thích
        </Badge>
        {/* Nút tim thả wishlist */}
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute top-3 right-3 rounded-full bg-muted/80 p-2 shadow hover:bg-muted"
        >
          <Heart
            className={`w-6 h-6 ${
              liked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>
      <CardContent className="p-3 pb-2">
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3 className="font-semibold text-base truncate text-card-foreground">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 text-base font-medium text-card-foreground">
            <span>★</span>
            <span>{property.rating.toFixed(property.rating % 1 ? 2 : 1)}</span>
          </div>
        </div>
        <div className="text-[15px] text-muted-foreground mb-0.5">
          {property.price} cho {property.nights} đêm
        </div>
      </CardContent>
    </Card>
  );
}

// Data giống hình
const airbnbProperties: Property[] = [
  {
    id: "1",
    name: "Phòng tại Quận 3",
    price: "₫880.000",
    nights: 2,
    rating: 5.0,
    image: "https://picsum.photos/id/1018/400/300",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Phòng tại Thành phố Hồ Chí Minh",
    price: "₫560.000",
    nights: 2,
    rating: 5.0,
    image: "https://picsum.photos/id/1021/400/300",
    isFavorite: false,
  },
  {
    id: "3",
    name: "Phòng chung tại Thành phố Hồ Chí Minh",
    price: "₫323.935",
    nights: 2,
    rating: 4.86,
    image: "https://picsum.photos/id/1025/400/300",
    isFavorite: false,
  },
  {
    id: "4",
    name: "Phòng tại Tân Phú district",
    price: "₫798.824",
    nights: 2,
    rating: 4.87,
    image: "https://picsum.photos/id/1027/400/300",
    isFavorite: false,
  },
  {
    id: "5",
    name: "Nơi ở tại Thành phố Hồ Chí Minh",
    price: "₫776.000",
    nights: 2,
    rating: 4.97,
    image: "https://picsum.photos/id/1035/400/300",
    isFavorite: false,
  },
  {
    id: "6",
    name: "Nơi ở tại Thành phố Hồ Chí Minh",
    price: "₫910.550",
    nights: 2,
    rating: 4.94,
    image: "https://picsum.photos/id/1033/400/300",
    isFavorite: false,
  },
  {
    id: "7",
    name: "Phòng tại Thành phố Hồ Chí Minh",
    price: "₫600.000",
    nights: 2,
    rating: 5.0,
    image: "https://picsum.photos/id/1032/400/300",
    isFavorite: false,
  },
];
