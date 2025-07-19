import * as React from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchListings, fetchListingById } from '@/store/slices/listingSlice';
import type { RootState } from '@/store';
import { Listing } from '@/types/listing';
import { useNavigate } from 'react-router-dom';

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

  const { listings, loading, error } = useSelector((state: RootState) => state.listings);

  // Ref cho hàng đầu tiên để scroll ngang khi click nút trên cùng
  const rowRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    dispatch(fetchListings({ limit: 14 }));
  }, [dispatch]);

  const scrollRow = (index: number, direction: 'left' | 'right') => {
    const rowRef = rowRefs.current[index];
    if (!rowRef) return;

    const scrollAmount = 340;
    rowRef.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleViewDetail = async (id: string) => {
    try {
      await dispatch(fetchListingById(id));
      navigate(`/list/${id}`);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết listing:', error);
    }
  };

  // Chia listings thành các hàng, mỗi hàng tối đa 7 card
  const chunkedListings = chunkArray(listings, 7);

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Section title & scroll */}
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold text-card-foreground'>
          Nơi lưu trú được ưa chuộng tại Hồ Chí Minh <span className='text-2xl'>›</span>
        </h2>
      </div>

      {/* Nhiều hàng, mỗi hàng tối đa 7 card, scroll ngang từng hàng với nút */}
      <div className="flex flex-col gap-6">
        {loading && <p className='text-muted-foreground'>Đang tải dữ liệu...</p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && chunkedListings.map((row, idx) => (
          <div key={idx} className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <div />
              <div className="flex gap-2">
          <Button
            size='icon'
            className='rounded-full bg-muted hover:bg-muted/70'
                  onClick={() => scrollRow(idx, 'left')}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
          </Button>
          <Button
            size='icon'
            className='rounded-full bg-muted hover:bg-muted/70'
                  onClick={() => scrollRow(idx, 'right')}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </div>
      <div
              ref={el => { rowRefs.current[idx] = el; }}
              className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {row.map((property: Listing) => (
            <PropertyCard key={property._id} property={property} onViewDetail={handleViewDetail} />
              ))}
            </div>
          </div>
          ))}
      </div>
    </div>
  );
}

function PropertyCard({ property, onViewDetail }: { property: Listing; onViewDetail: (id: string) => void }) {
  const [liked, setLiked] = React.useState(property.is_verified);
  const imageUrl = property.images?.[0]?.startsWith('http')
    ? property.images[0]
    : `https://yourcdn.com${property.images?.[0]}`;

  return (
    <Card
      onClick={() => onViewDetail(property._id)}
      className='min-w-[280px] max-w-[280px] rounded-2xl bg-card border-none shadow hover:shadow-lg transition cursor-pointer'>
      <div className='relative'>
        <img
          src={imageUrl || 'https://placehold.co/400x300'}
          alt={property.title}
          className='h-[220px] w-full object-cover rounded-2xl'
        />
        <Badge className='absolute top-3 left-3 bg-muted text-foreground font-medium rounded-xl shadow px-3 py-1 backdrop-blur'>
          Được khách yêu thích
        </Badge>
        <button
          onClick={(e) => {
            e.stopPropagation(); // để không trigger onClick Card
            setLiked((v) => !v);
          }}
          className='absolute top-3 right-3 rounded-full bg-muted/80 p-2 shadow hover:bg-muted'>
          <Heart className={`w-6 h-6 ${liked ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
        </button>
      </div>
      <CardContent className='p-3 pb-2'>
        <div className='flex justify-between items-center gap-2 mb-1'>
          <h3 className='font-semibold text-base truncate text-card-foreground'>{property.title}</h3>
          <div className='flex items-center gap-1 text-base font-medium text-card-foreground'>
            <span>★</span>
            <span>{property.average_rating?.toFixed(1) ?? '--'}</span>
          </div>
        </div>
        {/* Hiển thị giá tiền */}
        <div className='text-[15px] text-black font-semibold mb-0.5'>
          {property.price_per_night?.toLocaleString()}₫ / đêm
        </div>
        <div className='text-[15px] text-muted-foreground mb-0.5'>
          {property.guests ?? 2} khách
        </div>
      </CardContent>
    </Card>
  );
}
