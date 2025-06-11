import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type DropzoneUploadProps = {
  images: File[];
  setImages: (images: File[]) => void;
};

export const DropzoneUpload = ({ images, setImages }: DropzoneUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages([...images, ...acceptedFiles]);
  }, [images, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    },
    multiple: true,
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-6 py-12 cursor-pointer transition",
          isDragActive ? "border-rose-500 bg-rose-50" : "border-gray-300 bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-sm">
          Kéo ảnh vào đây hoặc <span className="text-rose-500 font-medium">chọn ảnh</span> từ thiết bị
        </p>
        <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG (tối đa 10MB mỗi ảnh)</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          {images.map((file, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Ảnh ${index + 1}`}
                className="h-40 w-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
