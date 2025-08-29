"use client";

import { EditBannerModal } from "@/components/modals/edit-banner-modal";
import { Button } from "@/components/ui/button";
import { useBannerUrl } from "@/hooks/use-banner-url";
import { useUserStore } from "@/hooks/use-user-store";
import { Edit, MoreVertical, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Banner() {
  const { userOverview } = useUserStore();
  const isAdmin = userOverview?.roles.includes("admin");
  const { bannerUrl, loading: bannerLoading } = useBannerUrl();

  const [showEditModal, setShowEditModal] = useState(false);

  if (bannerLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-full aspect-[6.52736318]  animate-pulse rounded-lg" />
      </div>
    );
  }

  // If not admin, show the banner with or without the image
  if (!isAdmin) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-full aspect-[6.52736318]  rounded-lg overflow-hidden relative">
          <Image
            src={bannerUrl || ""}
            alt="Home Banner"
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center relative glass">
        {bannerUrl ? (
          <div className="relative w-full aspect-[6.52736318] overflow-hidden">
            <Image
              src={bannerUrl}
              alt="Home Banner"
              fill
              priority
              quality={100}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 100vw"
            />

            {/* Admin Context Menu */}
            <div className="absolute top-2 right-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Banner
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[6.52736318]  flex items-center justify-center">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="text-gray-400 hover:text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Banner
            </Button>
          </div>
        )}
      </div>

      {/* Edit Banner Modal */}
      <EditBannerModal open={showEditModal} onOpenChange={setShowEditModal} />
    </>
  );
}
