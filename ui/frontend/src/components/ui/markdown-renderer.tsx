"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          
          // For code blocks (not inline)
          if (!inline) {
            return (
              <div className="group relative mb-4">
                <pre className="overflow-x-auto rounded-md border border-neutral-200 bg-white/50 p-4 font-mono text-sm dark:border-neutral-800 dark:bg-neutral-950/50">
                  <code className={className} {...props}>
                    {String(children).replace(/\n$/, "")}
                  </code>
                </pre>
                <div className="invisible absolute right-2 top-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <CopyButton 
                    content={String(children)} 
                    copyMessage="Copied code to clipboard" 
                  />
                </div>
              </div>
            );
          }

          // For inline code
          return (
            <code className={cn("rounded-sm bg-neutral-100 px-1 py-0.5 font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200", className)} {...props}>
              {children}
            </code>
          );
        },
        // Style other markdown elements
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc pl-6 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal pl-6 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="mb-2 last:mb-0">{children}</li>,
        h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-3 text-xl font-bold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-3 text-lg font-bold">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="mb-4 border-l-4 border-neutral-200 pl-4 dark:border-neutral-800">
            {children}
          </blockquote>
        ),
      }}
      className="text-sm"
    >
      {children}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;