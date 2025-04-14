"use client";

import React, { useEffect, useState } from "react";
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

import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

// Interfaces para listar as consultas e entidades
interface Consultation {
  id_consulta: number;
  consult_data: string;
  consult_hora: string;
  doctorId: number;
  doctorName: string;
  doctorCPF: string;
  patientId: number;
  patientName: string;
  patientCPF: string;
  specialtyId: number;
  specialty: string;
}

// Para autocomplete e selects
interface Patient {
  id_paciente: number;
  pac_nome: string;
  pac_cpf: string;
}

interface Doctor {
  id_medico: number;
  id_profissional: number; // Campo adicionado para garantir o envio do id_profissional
  prof_nome: string;
  prof_cpf: string;
}

interface Specialty {
  id_tipo_consulta: number;
  tipoconsulta_nome: string;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

const ConsultasPage: React.FC = () => {
  // Lista de consultas
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Filtros (campo de busca e selects)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<number | "">("");
  const [filterDoctor, setFilterDoctor] = useState<number | "">("");
  const [filterPatient, setFilterPatient] = useState<number | "">("");
  const [registrationFrom, setRegistrationFrom] = useState("");
  const [registrationTo, setRegistrationTo] = useState("");

  // Listas completas para povoar selects
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);

  // Estados do Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);

  // Campos para criar/editar
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Autocomplete de Médico
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorResults, setDoctorResults] = useState<Doctor[]>([]);
  // Aqui vamos armazenar o id_profissional, não id_medico
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  // Autocomplete de Paciente
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [selectedPatientCPF, setSelectedPatientCPF] = useState("");

  // Especialidade (select)
  const [newSpecialtyId, setNewSpecialtyId] = useState<number | "">("");

  // AlertDialog para excluir
  const [alertOpen, setAlertOpen] = useState(false);
  const [consultToDelete, setConsultToDelete] = useState<Consultation | null>(null);

  // Carrega lista de consultas
  useEffect(() => {
    fetch("/api/consultas")
      .then((res) => res.json())
      .then((data) => {
        const mapped: Consultation[] = data.map((c: any) => ({
          id_consulta: c.id_consulta,
          consult_data: c.consult_data,
          consult_hora: c.consult_hora,
          doctorId: c.id_profissional || c.id_medico,
          doctorName: c.profissional_nome || c.prof_nome,
          doctorCPF: c.prof_cpf || "",
          patientId: c.id_paciente,
          patientName: c.pac_nome || "",
          patientCPF: c.pac_cpf || "",
          specialtyId: c.id_tipo_consulta,
          specialty: c.tipoconsulta_nome || "",
        }));
             
        setConsultations(mapped);
      })
      .catch((err) => console.error("Erro ao carregar consultas:", err));
  }, []);

  // Carrega listas para filtros e selects
  useEffect(() => {
    // Especialidades
    fetch("/api/tiposconsulta")
  .then((r) => r.json())
  .then((data: Specialty[]) => setAllSpecialties(data))
  .catch((err) => console.error(err));


    // Médicos
    fetch("/api/medicos")
      .then((r) => r.json())
      .then((data: any[]) => {
        const mappedDocs: Doctor[] = data.map((d) => ({
          id_medico: d.id_medico,
          id_profissional: d.id_profissional, // use id_profissional vindo do backend
          prof_nome: d.prof_nome,
          prof_cpf: d.prof_cpf,
        }));
        setAllDoctors(mappedDocs);
      })
      .catch((err) => console.error(err));

    // Pacientes
    fetch("/api/pacientes")
      .then((r) => r.json())
      .then((data: Patient[]) => setAllPatients(data))
      .catch((err) => console.error(err));
  }, []);

  // Ao abrir o dialog de edição
  useEffect(() => {
    if (dialogMode === "edit" && selectedConsultationId !== null) {
      const c = consultations.find((x) => x.id_consulta === selectedConsultationId);
      if (c) {
        setNewDate(c.consult_data);
        setNewTime(c.consult_hora);

        setSelectedDoctorId(c.doctorId);
        setSelectedDoctorName(c.doctorName);
        setDoctorSearch(c.doctorName || "");

        setSelectedPatientId(c.patientId);
        setSelectedPatientName(c.patientName);
        setSelectedPatientCPF(c.patientCPF);
        setPatientSearch(c.patientName || "");

        setNewSpecialtyId(c.specialtyId || "");
      }
    }
  }, [dialogMode, selectedConsultationId, consultations]);

  function clearForm() {
    setNewDate("");
    setNewTime("");
    setDoctorSearch("");
    setDoctorResults([]);
    setSelectedDoctorId(null);
    setSelectedDoctorName("");
    setPatientSearch("");
    setPatientResults([]);
    setSelectedPatientId(null);
    setSelectedPatientName("");
    setSelectedPatientCPF("");
    setNewSpecialtyId("");
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedConsultationId(null);
    clearForm();
    setDialogOpen(true);
  }

  function openEditDialog(id: number) {
    setDialogMode("edit");
    setSelectedConsultationId(id);
    setDialogOpen(true);
  }

  // SUBMIT (create/update)
  function handleSubmitConsultation(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate || !newTime || !selectedDoctorId || !selectedPatientId || !newSpecialtyId) {
      alert("Preencha todos os campos.");
      return;
    }

    const payload = {
      id_paciente: selectedPatientId,
      id_profissional: selectedDoctorId, // Enviando o id_profissional corretamente
      id_tipo_consulta: Number(newSpecialtyId),
      id_consult_status: 1,
      consult_data: newDate,
      consult_hora: newTime,
    };

    if (dialogMode === "create") {
      // Criar
      fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao criar consulta");
          return res.json();
        })
        .then((data) => {
          const newId = data.id_consulta;
          setConsultations((prev) => [
            ...prev,
            {
              id_consulta: newId,
              consult_data: newDate,
              consult_hora: newTime,
              doctorId: selectedDoctorId,
              doctorName: selectedDoctorName,
              doctorCPF: "", // Não é necessário exibir CPF do médico
              patientId: selectedPatientId,
              patientName: selectedPatientName,
              patientCPF: selectedPatientCPF,
              specialtyId: Number(newSpecialtyId),
              specialty:
                allSpecialties.find((s) => s.id_tipo_consulta === Number(newSpecialtyId))
                  ?.tipoconsulta_nome || "",
            },
          ]);
          setDialogOpen(false);
          clearForm();
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao criar consulta");
        });
    } else {
      // Editar
      if (!selectedConsultationId) return;
      fetch(`/api/consultas/${selectedConsultationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao atualizar consulta");
          return res.json();
        })
        .then(() => {
          setConsultations((prev) =>
            prev.map((c) =>
              c.id_consulta === selectedConsultationId
                ? {
                    ...c,
                    consult_data: newDate,
                    consult_hora: newTime,
                    doctorId: selectedDoctorId!,
                    doctorName: selectedDoctorName,
                    doctorCPF: "",
                    patientId: selectedPatientId!,
                    patientName: selectedPatientName,
                    patientCPF: selectedPatientCPF,
                    specialtyId: Number(newSpecialtyId),
                    specialty:
                      allSpecialties.find(
                        (s) => s.id_tipo_consulta === Number(newSpecialtyId)
                      )?.tipoconsulta_nome || "",
                  }
                : c
            )
          );
          setDialogOpen(false);
          clearForm();
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao atualizar consulta");
        });
    }
  }

  // ALERT: Excluir
  function openDeleteAlert(consultation: Consultation) {
    setConsultToDelete(consultation);
    setAlertOpen(true);
  }

  function handleConfirmDelete() {
    if (!consultToDelete) return;
    fetch(`/api/consultas/${consultToDelete.id_consulta}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao excluir consulta");
        setConsultations((prev) =>
          prev.filter((x) => x.id_consulta !== consultToDelete.id_consulta)
        );
        setAlertOpen(false);
        setConsultToDelete(null);
      })
      .catch((err) => {
        console.error(err);
        alert("Não foi possível excluir consulta.");
      });
  }

  // Registrar presença/ausência (exemplo)
  function handleRegisterPresence(id: number) {
    alert(`Presença registrada para ID ${id}`);
  }
  function handleRegisterAbsence(id: number) {
    alert(`Ausência registrada para ID ${id}`);
  }

  // FILTRO no front-end
  const filteredConsultations = consultations.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.consult_data.includes(term) ||
      c.consult_hora.includes(term) ||
      c.doctorName.toLowerCase().includes(term) ||
      c.doctorCPF?.includes(term) ||
      c.patientName.toLowerCase().includes(term) ||
      c.patientCPF?.includes(term) ||
      c.specialty.toLowerCase().includes(term);

    const matchesSpecialty =
      !filterSpecialty || c.specialtyId === filterSpecialty;
    const matchesDoctor =
      !filterDoctor || c.doctorId === filterDoctor;
    const matchesPatient =
      !filterPatient || c.patientId === filterPatient;

    const matchesDate =
      (!registrationFrom || c.consult_data >= registrationFrom) &&
      (!registrationTo || c.consult_data <= registrationTo);

    return matchesSearch && matchesSpecialty && matchesDoctor && matchesPatient && matchesDate;
  });

  // AUTOCOMPLETE: médico
  useEffect(() => {
    if (doctorSearch.length < 2) {
      setDoctorResults([]);
      return;
    }
    const abort = new AbortController();
    fetch(`/api/medicos?search=${doctorSearch}`, { signal: abort.signal })
      .then((r) => r.json())
      .then((data: any[]) => {
        const docs: Doctor[] = data.map((d) => ({
          id_medico: d.id_medico,
          id_profissional: d.id_profissional,
          prof_nome: d.prof_nome,
          prof_cpf: d.prof_cpf,
        }));
        setDoctorResults(docs);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
      });
    return () => abort.abort();
  }, [doctorSearch]);

  function handleSelectDoctor(doc: Doctor) {
    // Armazena o id_profissional para garantir que a FK seja correta
    setSelectedDoctorId(doc.id_profissional);
    setSelectedDoctorName(doc.prof_nome);
    setDoctorSearch(doc.prof_nome);
    setDoctorResults([]);
  }

  // AUTOCOMPLETE: paciente
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }
    const abort = new AbortController();
    fetch(`/api/pacientes?search=${patientSearch}`, { signal: abort.signal })
      .then((r) => r.json())
      .then((data: any[]) => {
        const pacs: Patient[] = data.map((p) => ({
          id_paciente: p.id_paciente,
          pac_nome: p.pac_nome,
          pac_cpf: p.pac_cpf,
        }));
        setPatientResults(pacs);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
      });
    return () => abort.abort();
  }, [patientSearch]);

  function handleSelectPatient(pac: Patient) {
    setSelectedPatientId(pac.id_paciente);
    setSelectedPatientName(pac.pac_nome);
    setSelectedPatientCPF(pac.pac_cpf || "");
    setPatientSearch(pac.pac_nome);
    setPatientResults([]);
  }

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold font-quicksand">Consultas Agendadas</h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              placeholder="Pesquisar... (nome, CPF, data...)"
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

            {/* Filtro Especialidade */}
            <select
  value={filterSpecialty}
  onChange={(e) =>
    setFilterSpecialty(e.target.value ? Number(e.target.value) : "")
  }
  className="px-3 py-2 border rounded-md"
>
  <option value="">Todas Especialidades</option>
  {allSpecialties.map((s) => (
    <option key={s.id_tipo_consulta} value={s.id_tipo_consulta}>
      {s.tipoconsulta_nome}
    </option>
  ))}
</select>


            {/* Filtro Médico */}
            <select
              value={filterDoctor}
              onChange={(e) =>
                setFilterDoctor(e.target.value ? Number(e.target.value) : "")
              }
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todos Médicos</option>
              {allDoctors.map((d) => (
                <option key={d.id_medico} value={d.id_medico}>
                  {d.prof_nome}
                </option>
              ))}
            </select>

            {/* Filtro Paciente */}
            <select
              value={filterPatient}
              onChange={(e) =>
                setFilterPatient(e.target.value ? Number(e.target.value) : "")
              }
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todos Pacientes</option>
              {allPatients.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.pac_nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 sm:mt-0">
            <Button variant="default" onClick={openCreateDialog}>
              Cadastrar Consulta
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-quicksand">Consultas Cadastradas</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Abaixo está a lista de consultas do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full table-auto border-separate border-spacing-0 text-sm">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.map((c) => (
                    <TableRow
                      key={c.id_consulta}
                      className="border-b last:border-0 even:bg-muted/25 hover:bg-muted/50"
                    >
                      <TableCell>
                        {new Date(c.consult_data).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{c.consult_hora}</TableCell>
                      <TableCell>{c.doctorName}</TableCell>
                      <TableCell>
                        {c.patientName}
                        <br />
                        <small className="text-xs text-muted-foreground">
                          CPF: {c.patientCPF}
                        </small>
                      </TableCell>
                      <TableCell>{c.specialty}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(c.id_consulta)}
                          >
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
                          <Button size="sm" onClick={() => handleRegisterPresence(c.id_consulta)}>
                            Presença
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRegisterAbsence(c.id_consulta)}
                          >
                            Ausência
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredConsultations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-2 py-4 text-center text-muted-foreground">
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

      {/* Dialog CREATE/EDIT */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[700px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Cadastrar Consulta" : "Editar Consulta"}</DialogTitle>
            <DialogDescription>Preencha todos os campos obrigatórios.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitConsultation}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Data */}
              <div className="flex flex-col gap-1">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              {/* Hora */}
              <div className="flex flex-col gap-1">
                <Label>Hora *</Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>

              {/* Autocomplete Médico */}
              <div className="flex flex-col gap-1 relative">
                <Label>Médico *</Label>
                <Input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => {
                    setDoctorSearch(e.target.value);
                    if (!e.target.value) {
                      setSelectedDoctorId(null);
                      setSelectedDoctorName("");
                    }
                  }}
                  onBlur={() => setTimeout(() => setDoctorResults([]), 200)}
                  placeholder="Digite nome/CPF do médico..."
                  required
                />
                {doctorResults.length > 0 && doctorSearch.length >= 2 && (
                  <div className="absolute top-full left-0 w-full bg-white border z-10">
                    {doctorResults.map((doc) => (
                      <div
                        key={doc.id_medico}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={() => handleSelectDoctor(doc)}
                      >
                        {doc.prof_nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Autocomplete Paciente */}
              <div className="flex flex-col gap-1 relative">
                <Label>Paciente *</Label>
                <Input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (!e.target.value) {
                      setSelectedPatientId(null);
                      setSelectedPatientName("");
                      setSelectedPatientCPF("");
                    }
                  }}
                  onBlur={() => setTimeout(() => setPatientResults([]), 200)}
                  placeholder="Digite nome/CPF do paciente..."
                  required
                />
                {patientResults.length > 0 && patientSearch.length >= 2 && (
                  <div className="absolute top-full left-0 w-full bg-white border z-10">
                    {patientResults.map((p) => (
                      <div
                        key={p.id_paciente}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={() => handleSelectPatient(p)}
                      >
                        {p.pac_nome} - CPF: {p.pac_cpf}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CPF do Paciente (somente leitura) */}
              {selectedPatientCPF && (
                <div className="flex flex-col gap-1">
                  <Label>CPF do Paciente</Label>
                  <Input type="text" readOnly value={selectedPatientCPF} />
                </div>
              )}

              {/* Especialidade */}
              <div className="flex flex-col gap-1">
                <Label>Especialidade *</Label>
                <select
  className="px-3 py-2 border rounded-md"
  value={newSpecialtyId}
  onChange={(e) =>
    setNewSpecialtyId(e.target.value ? Number(e.target.value) : "")
  }
  required
>
  <option value="">Selecione...</option>
  {allSpecialties.map((s) => (
    <option key={s.id_tipo_consulta} value={s.id_tipo_consulta}>
      {s.tipoconsulta_nome}
    </option>
  ))}
</select>

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

      {/* AlertDialog para excluir */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta consulta? Não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsultasPage;
