import { useEffect } from "react";

interface UseDocumentTitleOptions {
  baseTitle?: string;
  separator?: string;
}

/**
 * Custom hook để quản lý title động của trang web
 * @param title - Title chính của trang
 * @param options - Các tùy chọn cấu hình
 */
export const useDocumentTitle = (
  title: string,
  options: UseDocumentTitleOptions = {}
) => {
  const { baseTitle = "Vinaside", separator = " | " } = options;

  useEffect(() => {
    const fullTitle = title ? `${title}${separator}${baseTitle}` : baseTitle;
    document.title = fullTitle;

    // Cleanup function để reset title khi component unmount
    return () => {
      document.title = baseTitle;
    };
  }, [title, baseTitle, separator]);
};

/**
 * Hook để set title đơn giản (không có base title)
 */
export const useSimpleTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
