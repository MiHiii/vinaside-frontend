

// components/UserLanguageSelect.tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserLanguage } from "@/types/user";

interface Props {
  value: UserLanguage;
  onChange: (lang: UserLanguage) => void; // <-- Nhận đúng UserLanguage!
}

const UserLanguageSelect: React.FC<Props> = ({ value, onChange }) => (
  <Select
    value={value}
    onValueChange={(v) => onChange(v as UserLanguage)} // <-- ép kiểu tại đây
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="vi">Tiếng Việt</SelectItem>
      <SelectItem value="en">English</SelectItem>
    </SelectContent>
  </Select>
);

export default UserLanguageSelect;
