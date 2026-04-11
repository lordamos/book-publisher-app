import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageUrl: string, width: number, height: number) => void;
  isLoading?: boolean;
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onInsert,
  isLoading = false,
}: ImageUploadDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a valid image (JPEG, PNG, WebP, or GIF)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5MB";
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      return;
    }

    setFileName(file.name);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInsert = () => {
    if (!preview) {
      setError("Please select an image");
      return;
    }

    onInsert(preview, width, height);
    handleClose();
  };

  const handleClose = () => {
    setPreview(null);
    setFileName("");
    setWidth(300);
    setHeight(200);
    setError("");
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Insert Image
          </DialogTitle>
          <DialogDescription>
            Upload an image to add to your document. Drag and drop or click to select.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          {!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag and drop your image here</p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to select from your computer
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Image Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview</p>
                <div className="border border-border rounded-lg p-4 bg-muted/30 flex items-center justify-center max-h-96 overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-80 object-contain"
                  />
                </div>
              </div>

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">File Name</label>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Dimensions</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {width} × {height} px
                  </p>
                </div>
              </div>

              {/* Size Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="width" className="text-sm font-medium">
                    Width (px)
                  </label>
                  <input
                    id="width"
                    type="number"
                    min="50"
                    max="600"
                    value={width}
                    onChange={(e) => setWidth(Math.max(50, parseInt(e.target.value) || 50))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="height" className="text-sm font-medium">
                    Height (px)
                  </label>
                  <input
                    id="height"
                    type="number"
                    min="50"
                    max="600"
                    value={height}
                    onChange={(e) => setHeight(Math.max(50, parseInt(e.target.value) || 50))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Change Image Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPreview(null);
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Different Image
              </Button>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={!preview || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Insert Image
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
