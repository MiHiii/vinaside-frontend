import { TitleManager } from "./TitleManager";

/**
 * Layout chung cho toàn bộ ứng dụng
 * Chứa TitleManager để quản lý title động
 */
export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TitleManager />
      {children}
    </>
  );
};
