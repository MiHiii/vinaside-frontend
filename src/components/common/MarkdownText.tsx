import React from "react";

// Helper function to check if URL is an image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
  ];
  const lowerUrl = url.toLowerCase();

  // Check file extension
  if (imageExtensions.some((ext) => lowerUrl.includes(ext))) {
    return true;
  }

  // Check for common image hosting domains
  const imageDomains = [
    "vinaside.sgp1.digitaloceanspaces.com",
    "images.unsplash.com",
    "picsum.photos",
    "via.placeholder.com",
    "imgur.com",
    "i.imgur.com",
    "placehold.co",
    "placeholdit.com",
  ];

  return imageDomains.some((domain) => lowerUrl.includes(domain));
};

interface MarkdownTextProps {
  text: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  text,
  className = "",
}) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, linkText, url] = match;
    const beforeMatch = text.slice(lastIndex, match.index);

    if (beforeMatch) {
      parts.push(beforeMatch);
    }

    // Check if this is an image link
    const isImageLink =
      isImageUrl(url) ||
      linkText.toLowerCase().includes("ảnh") ||
      linkText.toLowerCase().includes("image");

    if (isImageLink) {
      // Render as clickable link that opens image in new tab
      parts.push(
        <a
          key={`image-link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.open(url, "_blank");
          }}
        >
          {linkText}
        </a>
      );
    } else {
      // Determine link styling based on URL type
      let linkClassName =
        "text-blue-600 hover:text-blue-800 underline font-medium";
      let onClickHandler = undefined;

      if (url.startsWith("/room-detail/")) {
        linkClassName =
          "text-green-600 hover:text-green-800 underline font-medium";
        onClickHandler = (e: React.MouseEvent) => {
          e.preventDefault();
          const roomId = url.split("/room-detail/")[1];
          if (roomId) {
            window.open(`/room-detail/${roomId}`, "_blank");
          }
        };
      } else if (url.startsWith("http")) {
        linkClassName =
          "text-blue-600 hover:text-blue-800 underline font-medium";
      } else if (url.startsWith("/")) {
        linkClassName =
          "text-purple-600 hover:text-purple-800 underline font-medium";
      }

      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          onClick={onClickHandler}
        >
          {linkText}
        </a>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    parts.push(remainingText);
  }

  return <span className={className}>{parts.length > 0 ? parts : text}</span>;
};
