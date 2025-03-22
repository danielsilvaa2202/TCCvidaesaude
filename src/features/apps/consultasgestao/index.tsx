"use client";

import React, { useState, useEffect } from "react";

// -------------
// UI Components
// -------------
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// -------------
// Layout
// -------------
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

// -------------
// Types
// -------------
interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

interface Consultation {
  id: number;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "HH:mm"
  doctor: string;
  patient: string;
  specialty: string;
  // simulamos data de registro p/ filtrar
  registrationDate: string;
}

// -------------
// Mock: TopNav
// -------------
const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

const ConsultasPage: React.FC = () => {
  // -------------------------------------
  // State: consultas (exemplo)
  // -------------------------------------
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: 1,
      date: "2025-09-20",
      time: "10:00",
      doctor: "Dr. Daniel Silva",
      patient: "Renata Boppre",
      specialty: "Pediatria",
      registrationDate: "2025-08-01",
    },
    {
      id: 2,
      date: "2025-09-21",
      time: "14:30",
      doctor: "Dra. Maria Souza",
      patient: "João Silva",
      specialty: "Cardiologia",
      registrationDate: "2025-08-05",
    },
  ]);

  // -------------------------------------
  // State: Filtros
  // -------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [registrationFrom, setRegistrationFrom] = useState("");
  const [registrationTo, setRegistrationTo] = useState("");

  // -------------------------------------
  // State: create/edit dialog
  // -------------------------------------
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);

  // Campos do formulário
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newPatient, setNewPatient] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");

  // -------------------------------------
  // AlertDialog: excluir
  // -------------------------------------
  const [alertOpen, setAlertOpen] = useState(false);
  const [consultToDelete, setConsultToDelete] = useState<Consultation | null>(
    null
  );

  // -------------------------------------
  // Carrega no form ao editar
  // -------------------------------------
  useEffect(() => {
    if (dialogMode === "edit" && selectedConsultationId !== null) {
      const c = consultations.find((c) => c.id === selectedConsultationId);
      if (c) {
        setNewDate(c.date);
        setNewTime(c.time);
        setNewDoctor(c.doctor);
        setNewPatient(c.patient);
        setNewSpecialty(c.specialty);
      }
    }
  }, [dialogMode, selectedConsultationId, consultations]);

  // -------------------------------------
  // Limpa form
  // -------------------------------------
  const clearForm = () => {
    setNewDate("");
    setNewTime("");
    setNewDoctor("");
    setNewPatient("");
    setNewSpecialty("");
  };

  // -------------------------------------
  // Abrir create
  // -------------------------------------
  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedConsultationId(null);
    clearForm();
    setDialogOpen(true);
  };

  // -------------------------------------
  // Abrir edit
  // -------------------------------------
  const openEditDialog = (id: number) => {
    setDialogMode("edit");
    setSelectedConsultationId(id);
    setDialogOpen(true);
  };

  // -------------------------------------
  // Submit form
  // -------------------------------------
  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime || !newDoctor || !newPatient || !newSpecialty) {
      alert("Preencha todos os campos.");
      return;
    }

    if (dialogMode === "create") {
      const newId = consultations.length
        ? consultations[consultations.length - 1].id + 1
        : 1;
      const newConsult: Consultation = {
        id: newId,
        date: newDate,
        time: newTime,
        doctor: newDoctor,
        patient: newPatient,
        specialty: newSpecialty,
        registrationDate: new Date().toISOString().split("T")[0],
      };
      setConsultations((prev) => [...prev, newConsult]);
    } else {
      setConsultations((prev) =>
        prev.map((c) =>
          c.id === selectedConsultationId
            ? {
                ...c,
                date: newDate,
                time: newTime,
                doctor: newDoctor,
                patient: newPatient,
                specialty: newSpecialty,
              }
            : c
        )
      );
    }

    setDialogOpen(false);
    clearForm();
  };

  // -------------------------------------
  // Excluir
  // -------------------------------------
  const openDeleteAlert = (consultation: Consultation) => {
    setConsultToDelete(consultation);
    setAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (consultToDelete) {
      setConsultations((prev) => prev.filter((c) => c.id !== consultToDelete.id));
    }
    setAlertOpen(false);
    setConsultToDelete(null);
  };

  // -------------------------------------
  // Registrar presença/ausência
  // -------------------------------------
  const handleRegisterPresence = (id: number) => {
    alert(`Presença registrada para a consulta ID ${id}.`);
  };

  const handleRegisterAbsence = (id: number) => {
    alert(`Ausência registrada para a consulta ID ${id}.`);
  };

  // -------------------------------------
  // Filtro final
  // -------------------------------------
  const filteredConsultations = consultations.filter((c) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      c.date.includes(term) ||
      c.time.includes(term) ||
      c.doctor.toLowerCase().includes(term) ||
      c.patient.toLowerCase().includes(term) ||
      c.specialty.toLowerCase().includes(term);

    const matchesSpecialty =
      filterSpecialty === "" || c.specialty === filterSpecialty;

    const matchesDoctor = filterDoctor === "" || c.doctor === filterDoctor;
    const matchesPatient = filterPatient === "" || c.patient === filterPatient;

    const matchesDate =
      (!registrationFrom || c.date >= registrationFrom) &&
      (!registrationTo || c.date <= registrationTo);

    return matchesSearch && matchesSpecialty && matchesDoctor && matchesPatient && matchesDate;
  });

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        {/* Título */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold font-quicksand">Consultas Agendadas</h1>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Filtros à esquerda */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
            <Input
              type="date"
              value={registrationFrom}
              onChange={(e) => setRegistrationFrom(e.target.value)}
              className="w-auto"
            />
            <Input
              type="date"
              value={registrationTo}
              onChange={(e) => setRegistrationTo(e.target.value)}
              className="w-auto"
            />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Especialidade</option>
              <option value="Cardiologia">Cardiologia</option>
              <option value="Dermatologia">Dermatologia</option>
              <option value="Pediatria">Pediatria</option>
              <option value="Clínica Geral">Clínica Geral</option>
              <option value="Ginecologia">Ginecologia</option>
            </select>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Médico</option>
              <option value="Dr. Daniel Silva">Dr. Daniel Silva</option>
              <option value="Dra. Maria Souza">Dra. Maria Souza</option>
            </select>
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Paciente</option>
              <option value="Renata Boppre">Renata Boppre</option>
              <option value="João Silva">João Silva</option>
            </select>
          </div>

          {/* Botão de cadastrar */}
          <div className="mt-2 sm:mt-0">
            <Button variant="default" onClick={openCreateDialog}>
              Cadastrar Consulta
            </Button>
          </div>
        </div>

        {/* Card de consultas */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-quicksand">
              Consultas Cadastradas
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Abaixo está a lista de consultas do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full table-auto border-separate border-spacing-0 text-sm">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Data
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Hora
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Médico
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Paciente
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Especialidade
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-b last:border-0 even:bg-muted/25 hover:bg-muted/50"
                    >
                      <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                        {new Date(c.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {c.time}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {c.doctor}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {c.patient}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {c.specialty}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(c.id)}>
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteAlert(c)}
                              >
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                          <Button
                            size="sm"
                            onClick={() => handleRegisterPresence(c.id)}
                          >
                            Presença
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRegisterAbsence(c.id)}
                          >
                            Ausência
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredConsultations.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="px-2 py-4 text-center text-muted-foreground"
                      >
                        Nenhuma consulta encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption className="text-sm text-muted-foreground mt-2">
                  Total de {filteredConsultations.length} consulta(s).
                </TableCaption>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Dialog: criar/editar consulta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[700px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Cadastrar Consulta" : "Editar Consulta"}
            </DialogTitle>
            <DialogDescription>
              Preencha todos os campos obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitConsultation}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Data */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="date">Data *</Label>
                <Input
                  type="date"
                  id="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
              {/* Hora */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  type="time"
                  id="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>
              {/* Médico */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="doctor">Médico *</Label>
                <Input
                  type="text"
                  id="doctor"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  required
                />
              </div>
              {/* Paciente */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="patient">Paciente *</Label>
                <Input
                  type="text"
                  id="patient"
                  value={newPatient}
                  onChange={(e) => setNewPatient(e.target.value)}
                  required
                />
              </div>
              {/* Especialidade */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="specialty">Especialidade *</Label>
                <Input
                  type="text"
                  id="specialty"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {dialogMode === "create" ? "Cadastrar" : "Salvar"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: excluir consulta */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta consulta? Não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsultasPage;
