"use client";

import React, { useState, useEffect } from "react";
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

// Funções para formatação dos inputs
const formatCPF = (value: string): string => {
  // Remove tudo que não for dígito.
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11) digits = digits.slice(0, 11);
  if (digits.length > 9) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  } else if (digits.length > 6) {
    return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else if (digits.length > 3) {
    return digits.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  } else {
    return digits;
  }
};

const formatPhone = (value: string): string => {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11) digits = digits.slice(0, 11);
  if (digits.length > 6) {
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  } else if (digits.length > 2) {
    return digits.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    return digits;
  }
};

// ---------------------------
// Tipos para os links e para o paciente
// ---------------------------
interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

interface Patient {
  id: number;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string; // "AAAA-MM-DD"
  gender: string; // "M", "F", etc.
  cep: string;
  address: string;
  city: string;
  state: string;
  registrationDate: string; // "AAAA-MM-DD"
  active: boolean;
  pdfLink?: string;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];


const PacientesPage: React.FC = () => {
  // Lista de pacientes (exemplo inicial)
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      cpf: "123.456.789-00",
      name: "Kailane Del Conti",
      email: "kailane@example.com",
      phone: "(11) 98765-4321",
      birthDate: "1987-03-15",
      gender: "F",
      cep: "01001-000",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      registrationDate: "2023-03-01",
      active: true,
      pdfLink: "/exemplo_prontuario.pdf",
    },
  ]);

  // Filtros de busca e data de cadastro
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationFrom, setRegistrationFrom] = useState("");
  const [registrationTo, setRegistrationTo] = useState("");

  // Estado do Dialog para criação/edição
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Campos do formulário
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

  // Ao abrir em modo edição, carrega os dados do paciente selecionado
  useEffect(() => {
    if (dialogMode === "edit" && selectedPatientId !== null) {
      const patientToEdit = patients.find((p) => p.id === selectedPatientId);
      if (patientToEdit) {
        setCpf(patientToEdit.cpf);
        setName(patientToEdit.name);
        setEmail(patientToEdit.email);
        setPhone(patientToEdit.phone);
        setBirthDate(patientToEdit.birthDate);
        setGender(patientToEdit.gender);
        setCep(patientToEdit.cep);
        setAddress(patientToEdit.address);
        setCity(patientToEdit.city);
        setState(patientToEdit.state);
      }
    }
  }, [dialogMode, selectedPatientId, patients]);

  // Limpa os campos do formulário
  const clearForm = (): void => {
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

  // Abre o modal em modo "create"
  const openCreateDialog = (): void => {
    setDialogMode("create");
    setSelectedPatientId(null);
    clearForm();
    setDialogOpen(true);
  };

  // Abre o modal em modo "edit"
  const openEditDialog = (id: number): void => {
    setDialogMode("edit");
    setSelectedPatientId(id);
    setDialogOpen(true);
  };

  // Submete o formulário (criação ou edição)
  const handleSubmitPatient = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!cpf || !name || !birthDate) {
      alert("CPF, Nome e Data de Nascimento são obrigatórios.");
      return;
    }

    if (dialogMode === "create") {
      const newPatient: Patient = {
        id: patients.length > 0 ? patients[patients.length - 1].id + 1 : 1,
        cpf,
        name,
        email,
        phone,
        birthDate,
        gender,
        cep,
        address,
        city,
        state,
        registrationDate: new Date().toISOString().split("T")[0],
        active: true,
        pdfLink: "/exemplo_prontuario.pdf",
      };
      setPatients((prev) => [...prev, newPatient]);
    } else {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatientId
            ? { ...p, cpf, name, email, phone, birthDate, gender, cep, address, city, state }
            : p
        )
      );
    }

    setDialogOpen(false);
    clearForm();
  };

  // ALERT DIALOG: Confirmação de exclusão
  const [alertOpen, setAlertOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const openDeleteAlert = (patient: Patient): void => {
    setPatientToDelete(patient);
    setAlertOpen(true);
  };

  const handleConfirmDelete = (): void => {
    if (patientToDelete) {
      setPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));
    }
    setAlertOpen(false);
    setPatientToDelete(null);
  };

  // Filtro de pacientes: compara datas como strings (formato "AAAA-MM-DD")
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      patient.name.toLowerCase().includes(term) ||
      patient.cpf.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.phone.toLowerCase().includes(term) ||
      patient.address.toLowerCase().includes(term) ||
      patient.city.toLowerCase().includes(term) ||
      patient.state.toLowerCase().includes(term);

    const matchesDate =
      (!registrationFrom || patient.registrationDate >= registrationFrom) &&
      (!registrationTo || patient.registrationDate <= registrationTo);

    return matchesSearch && matchesDate;
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

        {/* Filtros de busca e data */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-48"
            />
            <Input
              type="date"
              value={registrationFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRegistrationFrom(e.target.value)
              }
              className="w-auto"
            />
            <Input
              type="date"
              value={registrationTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRegistrationTo(e.target.value)
              }
              className="w-auto"
            />
          </div>
          <div className="mt-2 sm:mt-0">
            <Button variant="default" onClick={openCreateDialog}>
              Cadastrar Paciente
            </Button>
          </div>
        </div>

        {/* Tabela de Pacientes */}
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
              <Table className="w-full table-auto border-separate border-spacing-0 text-sm">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Nome
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      CPF
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Nascimento
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      E-mail
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Telefone
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Endereço
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Cidade/Estado
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      Cadastro
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="border-b last:border-0 even:bg-muted/25 hover:bg-muted/50"
                    >
                      <TableCell className="px-2 py-2 align-middle">{patient.name}</TableCell>
                      <TableCell className="px-2 py-2 align-middle">{patient.cpf}</TableCell>
                      <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                        {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">{patient.email}</TableCell>
                      <TableCell className="px-2 py-2 align-middle">{patient.phone}</TableCell>
                      <TableCell className="px-2 py-2 align-middle">{patient.address}</TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {patient.city} / {patient.state}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                        {new Date(patient.registrationDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(patient.id)}>
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" onClick={() => openDeleteAlert(patient)}>
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="px-2 py-4 text-center text-muted-foreground">
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

      {/* Modal de Criação/Edição de Paciente */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[800px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Cadastrar Paciente" : "Editar Paciente"}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos obrigatórios e clique em &quot;Salvar&quot;.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPatient}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* CPF */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCpf(formatCPF(e.target.value))
                  }
                  required
                />
              </div>
              {/* Nome */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
              {/* E-mail */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>
              {/* Telefone */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhone(formatPhone(e.target.value))
                  }
                />
              </div>
              {/* Data de Nascimento */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBirthDate(e.target.value)
                  }
                  required
                />
              </div>
              {/* Gênero */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="gender">Gênero</Label>
                <Input
                  type="text"
                  id="gender"
                  placeholder="M, F..."
                  value={gender}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGender(e.target.value)
                  }
                />
              </div>
              {/* CEP */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  type="text"
                  id="cep"
                  value={cep}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCep(e.target.value)
                  }
                />
              </div>
              {/* Endereço */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddress(e.target.value)
                  }
                />
              </div>
              {/* Cidade */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCity(e.target.value)
                  }
                />
              </div>
              {/* Estado */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="state">Estado</Label>
                <Input
                  type="text"
                  id="state"
                  placeholder="Ex: SP"
                  value={state}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setState(e.target.value)
                  }
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

      {/* ALERT DIALOG: Exclusão de Paciente */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. O paciente será removido permanentemente do sistema.
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

export default PacientesPage;
