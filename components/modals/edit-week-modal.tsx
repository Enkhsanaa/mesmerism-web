"use client";

import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface EditWeekModalProps {
  week: DbCompetitionWeek | null;
  isOpen: boolean;
  onClose: () => void;
  onWeekUpdated: (updatedWeek: DbCompetitionWeek) => void;
}

export function EditWeekModal({
  week,
  isOpen,
  onClose,
  onWeekUpdated,
}: EditWeekModalProps) {
  const { supabase } = useRealtimeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    week_number: 1,
    title: "",
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  // Reset form when week changes or modal opens
  useEffect(() => {
    if (week && isOpen) {
      setFormData({
        week_number: week.week_number,
        title: week.title || "",
        starts_at: week.starts_at ? formatDateForInput(week.starts_at) : "",
        ends_at: week.ends_at ? formatDateForInput(week.ends_at) : "",
        is_active: week.is_active,
      });
    }
  }, [week, isOpen]);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!week) return;

    setIsLoading(true);
    try {
      const updateData: Partial<DbCompetitionWeek> = {
        week_number: formData.week_number,
        title: formData.title || null,
        starts_at: formData.starts_at
          ? new Date(formData.starts_at).toISOString()
          : null,
        ends_at: formData.ends_at
          ? new Date(formData.ends_at).toISOString()
          : null,
        is_active: formData.is_active,
      };

      const { data, error } = await supabase
        .from("competition_weeks")
        .update(updateData)
        .eq("id", week.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating week:", error);
        alert("Алдаа гарлаа: " + error.message);
        return;
      }

      if (data) {
        onWeekUpdated(data);
        onClose();
      }
    } catch (error) {
      console.error("Error updating week:", error);
      alert("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Засварлах</DialogTitle>
          <DialogDescription>
            Тэмцээний 7 хоногийн мэдээллийг шинэчлэх
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="7 хоногийн нэр"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="starts_at">Эхлэх огноо</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) =>
                setFormData({ ...formData, starts_at: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ends_at">Дуусах огноо</Label>
            <Input
              id="ends_at"
              type="datetime-local"
              value={formData.ends_at}
              onChange={(e) =>
                setFormData({ ...formData, ends_at: e.target.value })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked as boolean })
              }
            />
            <Label htmlFor="is_active">Идэвхтэй</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Цуцлах
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
