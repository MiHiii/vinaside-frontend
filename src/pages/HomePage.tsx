import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchListings,
  fetchListingById,
  fetchTopViewedListings,
  fetchTopRatedListings,
  fetchTopWishlistListings,
} from "@/store/slices/listingSlice";
import type { RootState } from "@/store";
import { Listing } from "@/types/listing";
import { useNavigate } from "react-router-dom";
import ButtonWishlist from "@/components/common/ButtonWishlist";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Helper function để chia mảng thành các mảng con size 7
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { listings, loading, error } = useSelector(
    (state: RootState) => state.listings
  );
  const topViewedListings = useSelector(
    (state: RootState) => state.listings.topViewedListings
  );
  const topRatedListings = useSelector(
    (state: RootState) => state.listings.topRatedListings
  );
  const topWishlistListings = useSelector(
    (state: RootState) => state.listings.topWishlistListings
  );
  const topListingsLoading = useSelector(
    (state: RootState) => state.listings.topListingsLoading
  );
  const topListingsError = useSelector(
    (state: RootState) => state.listings.topListingsError
  );

  const [localListings, setLocalListings] = React.useState(listings);

  // Ref cho hàng đầu tiên để scroll ngang khi click nút trên cùng
  const rowRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    dispatch(fetchListings({ limit: 14 }));
    dispatch(fetchTopViewedListings({ limit: 7 }));
    dispatch(fetchTopRatedListings({ limit: 7 }));
    dispatch(fetchTopWishlistListings({ limit: 7 }));
  }, [dispatch]);

  // Hiện toast khi có error
  React.useEffect(() => {
    if (error) {
      toast.error(error || "Đã xảy ra lỗi mạng. Vui lòng thử lại sau.");
    }
    if (topListingsError) {
      toast.error(
        topListingsError ||
          "Đã xảy ra lỗi khi tải top listings. Vui lòng thử lại sau."
      );
    }
  }, [error, topListingsError]);

  // Cập nhật localListings khi listings redux thay đổi
  React.useEffect(() => {
    // Chỉ hiển thị những phòng có trạng thái active
    const activeListings = listings.filter(
      (listing) => listing.status === "active"
    );
    setLocalListings(activeListings);
  }, [listings]);

  const scrollRow = (index: number, direction: "left" | "right") => {
    const rowRef = rowRefs.current[index];
    if (!rowRef) return;

    const scrollAmount = 340;
    rowRef.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleViewDetail = async (id: string) => {
    try {
      await dispatch(fetchListingById(id));
      navigate(`/list/${id}`);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết listing:", error);
    }
  };

  // Handle click on section titles to navigate to search page
  const handleSectionTitleClick = (sectionType: string) => {
    let searchParams = new URLSearchParams();

    switch (sectionType) {
      case "all":
        // Khám phá tất cả phòng nghỉ - không cần thêm params
        break;
      case "topViewed":
        // Phòng được xem nhiều nhất
        searchParams.set("sortBy", "views");
        break;
      case "topRated":
        // Phòng được đánh giá cao nhất
        searchParams.set("sortBy", "rating");
        break;
      case "topWishlist":
        // Phòng được yêu thích nhất
        searchParams.set("sortBy", "wishlist");
        break;
    }

    const searchUrl = searchParams.toString()
      ? `/search?${searchParams.toString()}`
      : "/search";
    navigate(searchUrl);
  };

  // Chia localListings thành các hàng, mỗi hàng tối đa 7 card
  const chunkedListings = chunkArray(localListings, 7);

  // Component helper để render section top listings
  const TopListingsSection = ({
    title,
    listings,
    loading,
    sectionIndex,
    sectionType,
  }: {
    title: string;
    listings: Listing[];
    loading: boolean;
    sectionIndex: number;
    sectionType: string;
  }) => {
    const filteredListings = listings.filter(
      (listing) => listing.status === "active"
    );
    const sectionRef = React.useRef<HTMLDivElement>(null);

    const scrollSection = (direction: "left" | "right") => {
      const section = sectionRef.current;
      if (!section) return;

      const scrollAmount = 340;
      section.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    };

    if (loading) {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            {title}
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className="min-w-[280px] max-w-[280px]">
                <Skeleton className="h-[220px] w-full rounded-2xl mb-2" />
                <div className="p-3 pb-2">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (filteredListings.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-medium text-card-foreground cursor-pointer hover:text-gray-600 transition-colors"
            onClick={() => handleSectionTitleClick(sectionType)}
          >
            {title}
          </h2>
          <div className="flex gap-2">
            <Button
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/70"
              onClick={() => scrollSection("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/70"
              onClick={() => scrollSection("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </Button>
          </div>
        </div>
        <div
          ref={sectionRef}
          className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredListings.map((property: Listing) => (
            <PropertyCard
              key={property._id}
              property={property}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section title & scroll */}
      <div className="flex items-center justify-between mt-2">
        <h2
          className="text-xl font-medium text-card-foreground cursor-pointer hover:text-gray-600 transition-colors"
          onClick={() => handleSectionTitleClick("all")}
        >
          Khám phá tất cả phòng nghỉ tại Vinaside
        </h2>
      </div>

      {/* Nhiều hàng, mỗi hàng tối đa 7 card, scroll ngang từng hàng với nút */}
      <div className="flex flex-col gap-6 mb-8">
        {loading || error ? (
          // Hiển thị 2 hàng, mỗi hàng 7 skeleton card
          <>
            {[0, 1].map((rowIdx) => (
              <div
                key={rowIdx}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6"
              >
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="min-w-[280px] max-w-[280px] mt-5">
                    <Skeleton className="h-[220px] w-full rounded-2xl mb-2" />
                    <div className="p-3 pb-2">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/3 mb-1" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          chunkedListings.map((row, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <div />
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    className="rounded-full bg-muted hover:bg-muted/70"
                    onClick={() => scrollRow(idx, "left")}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    className="rounded-full bg-muted hover:bg-muted/70"
                    onClick={() => scrollRow(idx, "right")}
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-5 w-5 text-foreground" />
                  </Button>
                </div>
              </div>
              <div
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {row.map((property: Listing) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Top Viewed Listings */}
      <TopListingsSection
        title="Phòng được xem nhiều nhất"
        listings={topViewedListings}
        loading={topListingsLoading}
        sectionIndex={0}
        sectionType="topViewed"
      />

      {/* Top Rated Listings */}
      <TopListingsSection
        title="Phòng được đánh giá cao nhất"
        listings={topRatedListings}
        loading={topListingsLoading}
        sectionIndex={1}
        sectionType="topRated"
      />

      {/* Top Wishlist Listings */}
      <TopListingsSection
        title="Phòng được yêu thích nhất"
        listings={topWishlistListings}
        loading={topListingsLoading}
        sectionIndex={2}
        sectionType="topWishlist"
      />
    </div>
  );
}

type PropertyCardProps = {
  property: Listing;
  onViewDetail: (id: string) => void;
};

function PropertyCard({ property, onViewDetail }: PropertyCardProps) {
  // Không cần useState cho liked nữa, dùng trực tiếp property.is_wishlisted
  const imageUrl = property.images?.[0]?.startsWith("http")
    ? property.images[0]
    : `https://yourcdn.com${property.images?.[0]}`;

  return (
    <Card
      onClick={() => onViewDetail(property._id)}
      className="min-w-[280px] max-w-[280px] rounded-xl bg-card border-none hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <img
          src={imageUrl || "https://placehold.co/400x300"}
          alt={property.title}
          className="h-[220px] w-full object-cover rounded-2xl"
        />
        <Badge className="absolute top-3 left-3 bg-muted text-white text-[10px] font-medium rounded-xl shadow px-3 py-1 backdrop-blur">
          Được khách yêu thích
        </Badge>
        <ButtonWishlist liked={property.is_wishlisted} roomId={property._id} />
      </div>
      <CardContent className="p-3 pb-2">
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3 className="font-medium text-[15px] truncate text-card-foreground">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium text-card-foreground">
            <span>★</span>
            <span>{property.average_rating?.toFixed(1) ?? "--"}</span>
          </div>
        </div>
        {/* Hiển thị giá tiền */}
        <div className="text-sm text-gray-500 text-muted-foreground font-medium mb-1">
          {property.price_per_night?.toLocaleString()}₫ /đêm
        </div>
        {/* <div className="text-sm text-muted-foreground">
          {property.guests ?? 2} khách
        </div> */}
      </CardContent>
    </Card>
  );
}
