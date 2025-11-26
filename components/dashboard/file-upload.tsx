"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed");
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>

            <div>
              <p className="font-chalk text-lg font-bold text-gray-900">
                {dragActive ? "Drop your PDF here" : "Upload PDF"}
              </p>
              <p className="text-sm text-gray-500 font-sans mt-1">
                Click to browse or drag and drop
              </p>
            </div>

            <p className="text-xs text-gray-400 font-sans">
              Max size: {maxSizeMB}MB • PDF only
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-green-300 bg-green-50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-green-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-chalk font-bold text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600 font-sans">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 font-sans mt-2">{error}</p>
      )}
    </div>
  );
}
