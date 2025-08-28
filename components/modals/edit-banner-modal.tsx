"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBannerUrl } from "@/hooks/use-banner-url";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { toast } from "sonner";

interface EditBannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBannerModal({ open, onOpenChange }: EditBannerModalProps) {
  const { supabase, user } = useRealtime();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateBanner = useCallback(
    async (bannerFile: File) => {
      try {
        const filePath = `${user?.id}/banner/home-banner${
          bannerFile.name.includes(".")
            ? bannerFile.name.slice(bannerFile.name.lastIndexOf("."))
            : ".png"
        }`;

        const { data: uploadResult, error: uploadError } =
          await supabase.storage
            .from("images")
            .upload(filePath, bannerFile, { upsert: true });

        if (uploadError) {
          toast.error(uploadError.message);
          return;
        }

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;

        // Update the app_settings table
        const { error: dbError } = await supabase.from("app_settings").upsert({
          key: "home_banner_image_url",
          text_value: publicUrl,
        });

        if (dbError) {
          toast.error(dbError.message);
          return;
        }

        toast.success("Banner updated successfully.");
      } catch (error) {
        toast.error("An error occurred while updating the banner.");
      }
    },
    [supabase]
  );

  const handleUpdateBanner = useCallback(
    async (selectedFile: File | null) => {
      if (!selectedFile) {
        toast.error("No file selected.");
        return;
      }

      setIsUpdating(true);

      try {
        await updateBanner(selectedFile);
        onOpenChange(false);
        resetForm();
      } catch (error) {
        toast.error("An error occurred while updating the banner.");
      } finally {
        setIsUpdating(false);
      }
    },
    [updateBanner]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
          <DialogDescription>
            Select a new banner image to replace the current one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-3" htmlFor="banner-file">
              Select New Banner
            </Label>
            <Input
              id="banner-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
            />
          </div>

          {previewUrl && (
            <div>
              <Label>Preview</Label>
              <div className="mt-2">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={100}
                  className="w-full h-24 object-cover rounded"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdateBanner(selectedFile)}
            disabled={!selectedFile || isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
