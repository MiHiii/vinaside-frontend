// components/UserRoleSelect.tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserRole } from "@/types/user";

interface Props {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const UserRoleSelect: React.FC<Props> = ({ value, onChange }) => (
  <Select value={value} onValueChange={(v) => onChange(v as UserRole)}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="guest">Khách</SelectItem>
      <SelectItem value="host">Chủ nhà</SelectItem>
      <SelectItem value="admin">Admin</SelectItem>
    </SelectContent>
  </Select>
);

export default UserRoleSelect;
