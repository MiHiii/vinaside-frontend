import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, UploadCloud, Camera, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/services/api";

interface RefundImageUploadProps {
  images: File[];
  setImages: (images: File[]) => void;
  uploadedUrls: string[];
  setUploadedUrls: (urls: string[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

const RefundImageUpload: React.FC<RefundImageUploadProps> = ({
  images,
  setImages,
  uploadedUrls,
  setUploadedUrls,
  maxFiles = 5,
  maxSizePerFile = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Kiểm tra số lượng file
      if (images.length + acceptedFiles.length > maxFiles) {
        toast.error(`Chỉ có thể upload tối đa ${maxFiles} ảnh!`);
        return;
      }

      // Kiểm tra kích thước file
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > maxSizePerFile * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error(
          `Một số file vượt quá ${maxSizePerFile}MB: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      setImages([...images, ...acceptedFiles]);
    },
    [images, setImages, maxFiles, maxSizePerFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    maxFiles: maxFiles - images.length,
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeUploadedUrl = (index: number) => {
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ảnh để upload!");
      return;
    }

    setUploading(true);
    const newUploadProgress: { [key: string]: number } = {};
    images.forEach((_, index) => {
      newUploadProgress[index] = 0;
    });
    setUploadProgress(newUploadProgress);

    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post("/upload/multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            images.forEach((_, index) => {
              newUploadProgress[index] = percentCompleted;
            });
            setUploadProgress({ ...newUploadProgress });
          }
        },
      });

      console.log("Upload response:", response.data); // Debug log

      // Kiểm tra format response
      let newUrls: string[] = [];
      if (response.data && response.data.data && response.data.data.urls) {
        newUrls = response.data.data.urls;
      } else if (response.data && response.data.urls) {
        newUrls = response.data.urls;
      } else {
        throw new Error("Response format không đúng");
      }
      setUploadedUrls([...uploadedUrls, ...newUrls]);
      setImages([]); // Clear uploaded files
      setUploadProgress({});
      toast.success(`Upload thành công ${images.length} ảnh!`);
    } catch (error) {
      console.error("Upload error:", error);

      // Xử lý lỗi chi tiết hơn
      let errorMessage = "Upload ảnh thất bại! Vui lòng thử lại.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
            };
          };
        };
        if (axiosError.response?.status === 403) {
          errorMessage = "Không có quyền upload ảnh. Vui lòng liên hệ admin.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      toast.error(errorMessage);
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-6 py-12 cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-orange-500 bg-orange-50 scale-105"
            : "border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-25"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <UploadCloud className="h-12 w-12 text-gray-400" />
            <Camera className="h-6 w-6 text-orange-500 absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">
              {isDragActive
                ? "Thả ảnh vào đây..."
                : "Kéo ảnh vào đây hoặc click để chọn"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Hỗ trợ JPG, PNG, GIF, WebP (tối đa {maxSizePerFile}MB mỗi ảnh)
            </p>
            <p className="text-xs text-orange-500 mt-1 font-medium">
              Đã chọn: {images.length}/{maxFiles} ảnh
            </p>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      {images.length > 0 && (
        <div className="flex items-center gap-3">
          <Button
            onClick={uploadImages}
            disabled={uploading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Đang upload...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                <span>Upload {images.length} ảnh</span>
              </div>
            )}
          </Button>
          {uploading && (
            <div className="text-sm text-gray-600">
              {Object.values(uploadProgress).length > 0 &&
                `Tiến độ: ${Math.round(
                  Object.values(uploadProgress).reduce((a, b) => a + b, 0) /
                    Object.values(uploadProgress).length
                )}%`}
            </div>
          )}
        </div>
      )}

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Ảnh đã chọn (chưa upload)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((file, index) => (
              <Card
                key={`file-${index}`}
                className="relative overflow-hidden group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Ảnh ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {uploadProgress[index] !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                    {uploadProgress[index]}%
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2">
            <Camera className="h-4 w-4 text-green-600" />
            Ảnh đã upload ({uploadedUrls.length} ảnh)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedUrls.map((url, index) => (
              <Card
                key={`url-${index}`}
                className="relative overflow-hidden group"
              >
                <img
                  src={url}
                  alt={`Ảnh đã upload ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUploadedUrl(index);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs p-1 text-center">
                  Đã upload
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {uploadedUrls.length === 0 && images.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Vui lòng upload ít nhất 1 ảnh minh chứng hoàn tiền
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundImageUpload;
