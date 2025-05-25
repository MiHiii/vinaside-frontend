import * as React from "react";

export function Avatar({ className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-block overflow-hidden rounded-full bg-gray-200 ${className}`}
      {...props}
    />
  );
}

export function AvatarImage({ src, alt, className = "" }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={`object-cover w-full h-full ${className}`} />;
}

export function AvatarFallback({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex items-center justify-center w-full h-full text-gray-500 ${className}`}>
      {children}
    </span>
  );
} 