import { useDocumentTitle, useSimpleTitle } from "@/hooks/useDocumentTitle";

interface PageTitleProps {
  title: string;
  baseTitle?: string;
  separator?: string;
  children?: React.ReactNode;
}

/**
 * Component để set title cho trang cụ thể
 * Có thể sử dụng như một wrapper hoặc component độc lập
 */
export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  baseTitle = "Vinaside",
  separator = " | ",
  children,
}) => {
  useDocumentTitle(title, { baseTitle, separator });

  if (children) {
    return <>{children}</>;
  }

  return null;
};

/**
 * Component để set title đơn giản (không có base title)
 */
export const SimplePageTitle: React.FC<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => {
  useSimpleTitle(title);

  if (children) {
    return <>{children}</>;
  }

  return null;
};
