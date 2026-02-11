"use client";

import { useRef } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FileUploadButtonProps {
  selectedFiles: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function FileUploadButton({
  selectedFiles,
  onFilesSelected,
  onRemoveFile,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
    }
    e.target.value = "";
  };

  return (
    <div>
      {/* File previews above input */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((file, idx) => {
            const isImage = file.type.startsWith("image/");
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#d1fae5] rounded-lg px-2 py-1.5 text-xs"
              >
                {isImage ? (
                  <ImageIcon className="h-3.5 w-3.5 text-[#10b981]" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-[#10b981]" />
                )}
                <span className="text-[#0f1b2d] max-w-[120px] truncate">{file.name}</span>
                <span className="text-[#6b7280]">({formatFileSize(file.size)})</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-0.5 rounded hover:bg-red-50 text-[#6b7280] hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Paperclip button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="p-2 rounded-lg hover:bg-gray-100 text-[#6b7280] hover:text-[#0f1b2d] transition-colors"
        title="Joindre un fichier"
      >
        <Paperclip className="h-4.5 w-4.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
        multiple
      />
    </div>
  );
}
