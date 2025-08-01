import React from "react";

// Utility function to parse markdown links [text](url) and convert them to clickable links
export const parseMarkdownLinks = (text: string): string => {
  // For now, we'll just return the text as-is and handle links in the component
  // This avoids JSX syntax issues in utility files
  return text;
};

// Function to extract room ID from markdown link
export const extractRoomIdFromLink = (text: string): string | null => {
  const roomDetailRegex = /\[([^\]]+)\]\(\/room-detail\/([^)]+)\)/;
  const match = text.match(roomDetailRegex);
  return match ? match[2] : null;
};

// Function to check if text contains markdown links
export const hasMarkdownLinks = (text: string): boolean => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return linkRegex.test(text);
};
