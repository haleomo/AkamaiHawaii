import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Upload, CloudUpload, Grid3x3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PhotoLightbox from "@/components/photo-lightbox";
import type { Photo } from "@shared/schema";

export default function PhotosView() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [filter, setFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    event: "",
    uploadedBy: "Anonymous Student",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setIsUploadOpen(false);
      setUploadData({
        title: "",
        description: "",
        event: "",
        uploadedBy: "Anonymous Student",
      });
      toast({
        title: "Success!",
        description: "Photo uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive",
      });
    },
  });

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

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select only image files.",
        variant: "destructive",
      });
      return;
    }

    if (imageFiles.length === 1) {
      const file = imageFiles[0];
      setUploadData(prev => ({
        ...prev,
        title: prev.title || file.name.split('.')[0],
      }));
      handleUpload(file);
    } else {
      // Handle multiple files
      imageFiles.forEach(file => handleUpload(file));
    }
  };

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("title", uploadData.title || file.name.split('.')[0]);
    formData.append("description", uploadData.description);
    formData.append("event", uploadData.event);
    formData.append("uploadedBy", uploadData.uploadedBy);

    uploadPhotoMutation.mutate(formData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const filteredPhotos = photos.filter(photo => {
    if (filter === "all") return true;
    return photo.event?.toLowerCase().includes(filter.toLowerCase());
  });

  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    const event = photo.event || "General";
    if (!acc[event]) {
      acc[event] = [];
    }
    acc[event].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Tide Memories</h2>
              <p className="text-slate-600">Share your team moments</p>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-navy-columbia text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photos
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Upload Photo</h3>
                    <p className="text-sm text-slate-600">Share your memories with the team</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Photo title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={uploadData.description}
                        onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What's happening in this photo?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event">Event</Label>
                      <Input
                        id="event"
                        value={uploadData.event}
                        onChange={(e) => setUploadData(prev => ({ ...prev, event: e.target.value }))}
                        placeholder="Water Polo Game, Practice, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="uploadedBy">Your Name</Label>
                      <Input
                        id="uploadedBy"
                        value={uploadData.uploadedBy}
                        onChange={(e) => setUploadData(prev => ({ ...prev, uploadedBy: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label>Select Photo</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-columbia file:text-white hover:file:bg-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? "border-columbia bg-columbia/10" : "border-slate-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudUpload className="text-2xl text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Drop photos here</h3>
            <p className="text-slate-600 mb-4">or click to browse your files</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <Label
              htmlFor="photo-upload"
              className="cursor-pointer bg-columbia hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all inline-block"
            >
              Choose Files
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Recent Memories</h3>
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="water-polo">Water Polo</SelectItem>
                  <SelectItem value="dance">Dances</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Photo Grid */}
          {Object.keys(groupedPhotos).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No photos yet</h3>
              <p className="text-slate-600">Upload some photos to start building your memory collection!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPhotos).map(([event, eventPhotos]) => (
                <div key={event}>
                  <h4 className="text-lg font-semibold text-slate-700 mb-4">{event}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eventPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`/api/photos/${photo.id}/file`}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {photo.title}
                          </p>
                          <p className="text-xs text-slate-600">
                            {format(new Date(photo.uploadedAt), "MMM d, yyyy")} • by {photo.uploadedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
