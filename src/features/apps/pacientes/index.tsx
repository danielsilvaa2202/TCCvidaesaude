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

interface Patient {
  id_paciente: number;
  pac_cpf: string;
  pac_nome: string;
  pac_email: string;
  pac_telefone: string;
  pac_data_nascimento: string;
  pac_genero: string;
  pac_cep: string;
  pac_endereco: string;
  pac_cidade: string;
  pac_estado: string;
  pac_data_cadastro: string;
  pac_ativo: boolean;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

const PacientesPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    let url = "/api/pacientes";
    const params = [];
    if (dateFrom) params.push(`data_ini=${dateFrom}`);
    if (dateTo) params.push(`data_fim=${dateTo}`);
    if (params.length > 0) url += "?" + params.join("&");

    fetch(url)
      .then((res) => res.json())
      .then((data: Patient[]) => {
        setPatients(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar pacientes:", err);
      });
  };

  useEffect(() => {
    if (dialogMode === "edit" && selectedPatientId !== null) {
      const p = patients.find((x) => x.id_paciente === selectedPatientId);
      if (p) {
        setCpf(p.pac_cpf);
        setName(p.pac_nome);
        setEmail(p.pac_email);
        setPhone(p.pac_telefone);
        setBirthDate(p.pac_data_nascimento);
        setGender(p.pac_genero);
        setCep(p.pac_cep);
        setAddress(p.pac_endereco);
        setCity(p.pac_cidade);
        setState(p.pac_estado);
      }
    }
  }, [dialogMode, selectedPatientId, patients]);

  const clearForm = () => {
    setCpf("");
    setName("");
    setEmail("");
    setPhone("");
    setBirthDate("");
    setGender("");
    setCep("");
    setAddress("");
    setCity("");
    setState("");
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedPatientId(null);
    clearForm();
    setDialogOpen(true);
  };

  const openEditDialog = (id: number) => {
    setDialogMode("edit");
    setSelectedPatientId(id);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cpf || !name || !birthDate) {
      alert("CPF, Nome e Data de Nascimento são obrigatórios.");
      return;
    }

    const payload = {
      pac_cpf: cpf,
      pac_nome: name,
      pac_email: email,
      pac_telefone: phone,
      pac_data_nascimento: birthDate,
      pac_genero: gender,
      pac_cep: cep,
      pac_endereco: address,
      pac_cidade: city,
      pac_estado: state
    }

    if (dialogMode === "create") {
      fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao criar paciente");
          return res.json();
        })
        .then((data) => {
          fetchPatients();
          setDialogOpen(false);
          clearForm();
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao criar paciente");
        });
    } else {
      if (!selectedPatientId) return;
      fetch(`/api/pacientes/${selectedPatientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao editar paciente");
          return res.json();
        })
        .then(() => {
          fetchPatients();
          setDialogOpen(false);
          clearForm();
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao editar paciente");
        });
    }
  };

  const openDeleteAlert = (p: Patient) => {
    setPatientToDelete(p);
    setAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!patientToDelete) return;
    fetch(`/api/pacientes/${patientToDelete.id_paciente}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao inativar paciente");
        fetchPatients();
        setAlertOpen(false);
        setPatientToDelete(null);
      })
      .catch((err) => {
        console.error(err);
        alert("Erro ao inativar paciente");
      });
  };

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.pac_nome.toLowerCase().includes(term) ||
      p.pac_cpf.toLowerCase().includes(term) ||
      p.pac_email.toLowerCase().includes(term) ||
      p.pac_endereco.toLowerCase().includes(term)
    );
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
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold font-quicksand">Lista de Pacientes</h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="mt-2 sm:mt-0">
            <Button onClick={openCreateDialog}>Cadastrar Paciente</Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-quicksand">
              Pacientes Cadastrados
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Abaixo está a lista de pacientes do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nascimento</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade/Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((p) => (
                    <TableRow key={p.id_paciente}>
                      <TableCell>{p.pac_nome}</TableCell>
                      <TableCell>{p.pac_cpf}</TableCell>
                      <TableCell>
  {new Date(p.pac_data_nascimento).toISOString().substring(0, 10).split("-").reverse().join("/")}
</TableCell>

                      <TableCell>{p.pac_email}</TableCell>
                      <TableCell>{p.pac_telefone}</TableCell>
                      <TableCell>{p.pac_endereco}</TableCell>
                      <TableCell>
                        {p.pac_cidade} / {p.pac_estado}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(p.id_paciente)}>
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteAlert(p)}
                              >
                                Inativar
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-4 text-center">
                        Nenhum paciente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption className="text-sm text-muted-foreground mt-2">
                  Total de {filteredPatients.length} paciente(s).
                </TableCaption>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[800px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Cadastrar Paciente" : "Editar Paciente"}
            </DialogTitle>
            <DialogDescription>Preencha os campos obrigatórios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>CPF *</Label>
                <Input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Nome *</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Telefone</Label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Gênero</Label>
                <Input
                  type="text"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>CEP</Label>
                <Input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Endereço</Label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Cidade</Label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Estado</Label>
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar Paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Inativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PacientesPage;
