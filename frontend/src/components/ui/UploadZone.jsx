/**
 * UploadZone component for drag-and-drop file uploads.
 * Supports PDF and DOCX files with visual feedback.
 */
import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const UploadZone = ({ onFileSelect, accept = '.pdf,.docx', maxSize = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file) => {
    setError('');

    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      return false;
    }

    // Check file size (in MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <FileText className="w-12 h-12 text-green-600" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        ) : (
          <div>
            <Upload
              className={`w-12 h-12 mx-auto mb-4 ${
                isDragging ? 'text-primary-600' : error ? 'text-red-600' : 'text-gray-400'
              }`}
            />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">PDF or DOCX (Max {maxSize}MB)</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default UploadZone;
