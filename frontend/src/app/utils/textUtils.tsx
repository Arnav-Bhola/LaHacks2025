import React from "react";
import { marked } from "marked"; // Import a Markdown parser like 'marked'

export const parseFormattedText = (text: string) => {
  // Convert Markdown to HTML using 'marked'
  const htmlContent = marked(text);

  // // Replace '\n' with '<br>' for new lines
  // const formattedHtml = htmlContent.replace(/\n/g, "<br>");

  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }} // Render the HTML safely
    />
  );
};
