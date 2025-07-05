import { useEffect } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Photo } from "@shared/schema";

interface PhotoLightboxProps {
  photo: Photo;
  onClose: () => void;
}

export default function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={24} />
        </Button>
        
        <img
          src={`/api/photos/${photo.id}/file`}
          alt={photo.title}
          className="max-w-full max-h-full object-contain"
        />
        
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-medium">{photo.title}</h3>
          <p className="text-sm text-gray-300">
            {photo.description && `${photo.description} • `}
            Uploaded {format(new Date(photo.uploadedAt), "MMM d, yyyy")} by {photo.uploadedBy}
          </p>
          {photo.event && (
            <p className="text-sm text-gray-300">Event: {photo.event}</p>
          )}
        </div>
      </div>
      
      {/* Background overlay - click to close */}
      <div
        className="absolute inset-0 z-0"
        onClick={onClose}
      />
    </div>
  );
}
