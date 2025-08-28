"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
  isParticipant: boolean;
}

interface AddParticipantsModalProps {
  week: DbCompetitionWeek | null;
  isOpen: boolean;
  onClose: () => void;
  onParticipantsUpdated?: () => void;
}

export default function AddParticipantsModal({
  week,
  isOpen,
  onClose,
  onParticipantsUpdated,
}: AddParticipantsModalProps) {
  const { supabase } = useRealtimeStore();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (week && isOpen) {
      fetchCreators();
    }
  }, [week, isOpen]);

  const fetchCreators = async () => {
    if (!week) return;

    setIsLoading(true);
    try {
      // First, get all users with creator role
      const { data: creatorsData, error: creatorsError } = await supabase
        .from("user_roles")
        .select(
          `
          user_id,
          users!user_roles_user_id_fkey(
            id,
            username,
            avatar_url
          )
        `
        )
        .eq("role", "creator");

      if (creatorsError) {
        console.error("Error fetching creators:", creatorsError);
        return;
      }

      // Get current participants for this week
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("week_participants")
          .select("creator_user_id")
          .eq("week_id", week.id);

      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        return;
      }

      const participantIds = new Set(
        participantsData?.map((p) => p.creator_user_id) || []
      );

      // Combine the data
      const creatorsWithParticipation: Creator[] = (creatorsData || []).map(
        (roleEntry: any) => ({
          id: roleEntry.users.id,
          username: roleEntry.users.username,
          avatar_url: roleEntry.users.avatar_url,
          isParticipant: participantIds.has(roleEntry.users.id),
        })
      );

      setCreators(creatorsWithParticipation);
    } catch (error) {
      console.error("Error fetching creators:", error);
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipationToggle = async (
    creatorId: string,
    isCurrentlyParticipant: boolean
  ) => {
    if (!week) return;

    setIsUpdating(true);
    try {
      if (isCurrentlyParticipant) {
        // Remove participant
        const { error } = await supabase
          .from("week_participants")
          .delete()
          .eq("week_id", week.id)
          .eq("creator_user_id", creatorId);

        if (error) {
          console.error("Error removing participant:", error);
          toast.error("Оролцогчийг хасахад алдаа гарлаа");
          return;
        }

        toast.success("Оролцогчийг амжилттай хаслаа");
      } else {
        // Add participant
        const { error } = await supabase.from("week_participants").insert({
          week_id: week.id,
          creator_user_id: creatorId,
        });

        if (error) {
          console.error("Error adding participant:", error);
          toast.error("Оролцогч нэмэхэд алдаа гарлаа");
          return;
        }

        toast.success("Оролцогчийг амжилттай нэмлээ");
      }

      // Update local state
      setCreators((prev) =>
        prev.map((creator) =>
          creator.id === creatorId
            ? { ...creator, isParticipant: !isCurrentlyParticipant }
            : creator
        )
      );

      onParticipantsUpdated?.();
    } catch (error) {
      console.error("Error updating participation:", error);
      toast.error("Алдаа гарлаа");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCreators = creators.filter((creator) =>
    creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const participantCount = creators.filter((c) => c.isParticipant).length;
  const totalCreators = creators.length;

  if (!week) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card-background border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            {week.title || `Week ${week.week_number}`} - Оролцогчид
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Тэмцээний долоо хонгийн оролцогчдыг удирдах
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary" className="bg-blue-600 text-white">
            <Users className="h-3 w-3 mr-1" />
            {participantCount}/{totalCreators} оролцогч
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Creator хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Creators List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-white">Ачааллаж байна...</div>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Creator олдсонгүй"}
              </p>
            </div>
          ) : (
            filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  creator.isParticipant
                    ? "bg-blue-600/10 border-blue-600/30"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={creator.avatar_url ?? ""} />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {creator.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{creator.username}</p>
                    <p className="text-sm text-gray-400">
                      {creator.isParticipant
                        ? "Оролцож байна"
                        : "Оролцохгүй байна"}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={creator.isParticipant ? "destructive" : "default"}
                  onClick={() =>
                    handleParticipationToggle(creator.id, creator.isParticipant)
                  }
                  disabled={isUpdating}
                  className={
                    creator.isParticipant
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {creator.isParticipant ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-1" />
                      Хасах
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Нэмэх
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-white border-gray-600"
          >
            Хаах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
