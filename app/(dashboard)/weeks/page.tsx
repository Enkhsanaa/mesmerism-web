"use client";
import { Card } from "@/components/ui/card";
import { useRealtime } from "../realtime-provider";
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Check, X } from "lucide-react";
import { EditWeekModal } from "@/components/modals/edit-week-modal";

export default function WeeksPage() {
  const { supabase } = useRealtime();
  const [weeks, setWeeks] = useState<DbCompetitionWeek[]>([]);
  const [editingWeek, setEditingWeek] = useState<DbCompetitionWeek | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("competition_weeks")
      .select("*")
      .then(({ data }) => {
        setWeeks(data || []);
      });
  }, []);

  const handleEditWeek = (week: DbCompetitionWeek) => {
    setEditingWeek(week);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWeek(null);
  };

  const handleWeekUpdated = (updatedWeek: DbCompetitionWeek) => {
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => (week.id === updatedWeek.id ? updatedWeek : week))
    );
  };

  return (
    <main className="mt-4">
      <Card className="p-4 bg-card-background">
        <h1 className="text-2xl font-bold">Тэмцээний 7 хонгууд</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Хонгийн нэр</TableHead>
              <TableHead>Хонгийн эхлэх огноо</TableHead>
              <TableHead>Хонгийн дуусах огноо</TableHead>
              <TableHead>Хонгийн төлөв</TableHead>
              <TableHead>Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week) => (
              <TableRow key={week.id}>
                <TableCell>{week.id}</TableCell>
                <TableCell>{week.title}</TableCell>
                <TableCell>
                  {week.starts_at
                    ? new Date(week.starts_at).toLocaleString("mn-MN", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })
                    : "---"}
                </TableCell>
                <TableCell>
                  {week.ends_at
                    ? new Date(week.ends_at).toLocaleString("mn-MN", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })
                    : "---"}
                </TableCell>
                <TableCell>
                  {week.is_active ? (
                    <Check className="size-4 text-green-500" strokeWidth={3} />
                  ) : (
                    <X className="size-4 text-red-500" strokeWidth={3} />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleEditWeek(week)}
                  >
                    Засварлах
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <EditWeekModal
        week={editingWeek}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onWeekUpdated={handleWeekUpdated}
      />
    </main>
  );
}
