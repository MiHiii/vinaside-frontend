import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Camera,
  TreePine,
  Utensils,
  ShoppingBag,
  Coffee,
  Landmark,
  ChefHat,
  Music,
  Mic,
  Film,
  BookOpen,
  History,
  Wine,
  PawPrint,
  Globe,
} from "lucide-react"

type HobbyOption = {
  id: string
  label: string
  icon: React.ReactNode
}

type ProfileHobbyDialogProps = {
  isOpen: boolean
  onClose: () => void
  title: string
}

const hobbies: HobbyOption[] = [
  { id: "do-an", label: "Đồ ăn", icon: <Utensils className="w-5 h-5" /> },
  { id: "ngoai-troi", label: "Hoạt động ngoài trời", icon: <TreePine className="w-5 h-5" /> },
  { id: "nhiep-anh", label: "Nhiếp ảnh", icon: <Camera className="w-5 h-5" /> },
  { id: "mua-sam", label: "Mua sắm", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "ca-phe", label: "Cà phê", icon: <Coffee className="w-5 h-5" /> },
  { id: "kien-truc", label: "Kiến trúc", icon: <Landmark className="w-5 h-5" /> },
  { id: "nau-an", label: "Nấu ăn", icon: <ChefHat className="w-5 h-5" /> },
  { id: "nhac-song", label: "Nhạc sống", icon: <Music className="w-5 h-5" /> },
  { id: "ca-hat", label: "Ca hát", icon: <Mic className="w-5 h-5" /> },
  { id: "phim-anh", label: "Phim ảnh", icon: <Film className="w-5 h-5" /> },
  { id: "bao-tang", label: "Bảo tàng", icon: <Landmark className="w-5 h-5" /> },
  { id: "lich-su", label: "Lịch sử", icon: <History className="w-5 h-5" /> },
  { id: "doc", label: "Đọc", icon: <BookOpen className="w-5 h-5" /> },
  { id: "van-hoa", label: "Văn hoá địa phương", icon: <Globe className="w-5 h-5" /> },
  { id: "ruou-vang", label: "Rượu vang", icon: <Wine className="w-5 h-5" /> },
  { id: "dong-vat", label: "Động vật", icon: <PawPrint className="w-5 h-5" /> },
]

export const ProfileHobbyDialog = ({ isOpen, onClose, title }: ProfileHobbyDialogProps) => {
  const [selected, setSelected] = useState<string[]>([])

  const toggleHobby = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length < 20
        ? [...prev, id]
        : prev
    )
  }

  const handleSave = () => {
    console.log("Sở thích đã chọn:", selected)
    onClose()
    setSelected([])
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setSelected([])
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[680px] bg-white p-6 rounded-2xl border-none shadow-[0_10px_50px_rgba(0,0,0,0.25)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>
            Chọn một số sở thích mà bạn muốn hiển thị trên hồ sơ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {hobbies.map((hobby) => (
            <button
              key={hobby.id}
              onClick={() => toggleHobby(hobby.id)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-full text-sm transition
                ${
                  selected.includes(hobby.id)
                    ? " text-black  border-black border-2"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
            >
              {hobby.icon}
              {hobby.label}
            </button>
          ))}     
        </div>

        <div className="text-sm text-gray-500 mt-4">
          Đã chọn {selected.length}/20
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleSave}
            className="px-10 py-6 text-white bg-black rounded-xl text-lg"
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
