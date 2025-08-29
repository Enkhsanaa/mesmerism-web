"use client";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AddParticipantsModal from "@/components/modals/add-participants-modal";
import { EditWeekModal } from "@/components/modals/edit-week-modal";
import { Check, Users, X } from "lucide-react";
import { useRealtime } from "../realtime-provider";

export default function WeeksPage() {
  const { supabase } = useRealtime();
  const [weeks, setWeeks] = useState<DbCompetitionWeek[]>([]);
  const [editingWeek, setEditingWeek] = useState<DbCompetitionWeek | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [participantsWeek, setParticipantsWeek] =
    useState<DbCompetitionWeek | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

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

  const handleManageParticipants = (week: DbCompetitionWeek) => {
    setParticipantsWeek(week);
    setIsParticipantsModalOpen(true);
  };

  const handleCloseParticipantsModal = () => {
    setIsParticipantsModalOpen(false);
    setParticipantsWeek(null);
  };

  return (
    <main className="mt-4">
      <Card className="p-4">
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
                <TableCell className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleEditWeek(week)}
                  >
                    Засварлах
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageParticipants(week)}
                    className="text-white border-gray-600 hover:bg-gray-700"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Оролцогчид
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

      <AddParticipantsModal
        week={participantsWeek}
        isOpen={isParticipantsModalOpen}
        onClose={handleCloseParticipantsModal}
      />
    </main>
  );
}
