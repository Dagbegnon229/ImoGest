"use client";

import { FileText, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import type { MessageAttachment } from "@/types/message";

interface AttachmentPreviewProps {
  attachments: MessageAttachment[];
  isOwn: boolean; // true = sent by current user, determines color scheme
}

export function AttachmentPreview({ attachments, isOwn }: AttachmentPreviewProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-1.5 mt-1">
      {attachments.map((att, idx) => {
        const isImage = att.type?.startsWith("image/");

        // If image, show inline preview
        if (isImage) {
          return (
            <div key={idx} className="rounded-lg overflow-hidden">
              <a href={att.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={att.url}
                  alt={att.name}
                  className="max-w-[240px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </a>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] ${isOwn ? "text-white/60" : "text-[#9ca3af]"}`}>
                  {att.name}
                </span>
              </div>
            </div>
          );
        }

        // Non-image file
        return (
          <a
            key={idx}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
              isOwn
                ? "bg-white/10 hover:bg-white/20"
                : "bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e5e7eb]"
            }`}
          >
            <FileText className={`h-4 w-4 flex-shrink-0 ${isOwn ? "text-white/70" : "text-[#6b7280]"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-medium truncate ${isOwn ? "text-white" : "text-[#171717]"}`}>
                {att.name}
              </p>
              <p className={`text-[10px] ${isOwn ? "text-white/50" : "text-[#9ca3af]"}`}>
                {formatFileSize(att.size)}
              </p>
            </div>
            <Download className={`h-3.5 w-3.5 flex-shrink-0 ${isOwn ? "text-white/60" : "text-[#6b7280]"}`} />
          </a>
        );
      })}
    </div>
  );
}
