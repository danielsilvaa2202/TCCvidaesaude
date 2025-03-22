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
  DialogTrigger,
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
// Helper funcs
// -------------
const formatCPF = (value: string): string => {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11) digits = digits.slice(0, 11);
  if (digits.length > 9) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  } else if (digits.length > 6) {
    return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else if (digits.length > 3) {
    return digits.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  }
  return digits;
};

const formatPhone = (value: string): string => {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11) digits = digits.slice(0, 11);
  if (digits.length > 6) {
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  } else if (digits.length > 2) {
    return digits.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  }
  return digits;
};

// -------------
// Types
// -------------
interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

interface Professional {
  id: number;
  name: string;          // prof_nome
  cpf: string;           // prof_cpf
  email: string;         // prof_email
  password: string;      // prof_senha
  phone: string;         // prof_telefone
  gender: string;        // prof_genero
  birthDate: string;     // prof_data_nascimento (YYYY-MM-DD)
  active: boolean;       // prof_ativo
  role: string;          // cargo (relacionado a id_cargo)
  registrationDate: string; // Simulated date for filtering
}

// Para o "Gerenciar Acessos" (exemplo de funcionalidades)
const ALL_ACCESS_OPTIONS = ["consultas", "pacientes", "admin"];

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];


const AdminPage: React.FC = () => {
  // -------------------------------------
  // State: professionals (example data)
  // -------------------------------------
  const [professionals, setProfessionals] = useState<Professional[]>([
    {
      id: 1,
      name: "Ana Clara Jayana",
      cpf: "123.456.789-00",
      email: "ana@example.com",
      password: "123456",
      phone: "(11) 98765-4321",
      gender: "F",
      birthDate: "1990-05-15",
      active: true,
      role: "Recepcionista",
      registrationDate: "2023-03-01",
    },
    {
      id: 2,
      name: "Carlos Santos",
      cpf: "987.654.321-00",
      email: "carlos@example.com",
      password: "abc123",
      phone: "(11) 91234-5678",
      gender: "M",
      birthDate: "1985-07-20",
      active: true,
      role: "Médico",
      registrationDate: "2023-02-10",
    },
  ]);

  // -------------------------------------
  // State: filters
  // -------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationFrom, setRegistrationFrom] = useState("");
  const [registrationTo, setRegistrationTo] = useState("");
  // Filtro adicional por cargo
  const [roleFilter, setRoleFilter] = useState("");

  // -------------------------------------
  // Dialog: create/edit
  // -------------------------------------
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedProfId, setSelectedProfId] = useState<number | null>(null);

  // Campos do form
  const [profCPF, setProfCPF] = useState("");
  const [profName, setProfName] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profPassword, setProfPassword] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profGender, setProfGender] = useState("");
  const [profBirthDate, setProfBirthDate] = useState("");
  const [profRole, setProfRole] = useState("Médico");

  // -------------------------------------
  // AlertDialog: excluir profissional
  // -------------------------------------
  const [alertOpen, setAlertOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(null);

  // -------------------------------------
  // Dialog: Gerenciar Acessos
  // -------------------------------------
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedAccessRole, setSelectedAccessRole] = useState("Médico");
  const [allowedAccesses, setAllowedAccesses] = useState<string[]>([]);

  const handleAccessCheckboxChange = (access: string) => {
    if (allowedAccesses.includes(access)) {
      setAllowedAccesses(allowedAccesses.filter((a) => a !== access));
    } else {
      setAllowedAccesses([...allowedAccesses, access]);
    }
  };

  const handleSaveAccesses = (e: React.FormEvent) => {
    e.preventDefault();
    // Exemplo: chamar API para salvar
    alert(`Acessos salvos para o cargo ${selectedAccessRole}:\n${allowedAccesses.join(", ")}`);
    setAccessDialogOpen(false);
  };

  // -------------------------------------
  // Carrega dados no formulário ao editar
  // -------------------------------------
  useEffect(() => {
    if (dialogMode === "edit" && selectedProfId !== null) {
      const prof = professionals.find((p) => p.id === selectedProfId);
      if (prof) {
        setProfCPF(prof.cpf);
        setProfName(prof.name);
        setProfEmail(prof.email);
        setProfPassword(""); // não exibimos a senha existente
        setProfPhone(prof.phone);
        setProfGender(prof.gender);
        setProfBirthDate(prof.birthDate);
        setProfRole(prof.role);
      }
    }
  }, [dialogMode, selectedProfId, professionals]);

  // -------------------------------------
  // Limpa o formulário
  // -------------------------------------
  const clearForm = (): void => {
    setProfCPF("");
    setProfName("");
    setProfEmail("");
    setProfPassword("");
    setProfPhone("");
    setProfGender("");
    setProfBirthDate("");
    setProfRole("Médico");
  };

  // -------------------------------------
  // Abrir "create"
  // -------------------------------------
  const openCreateDialog = (): void => {
    setDialogMode("create");
    setSelectedProfId(null);
    clearForm();
    setDialogOpen(true);
  };

  // -------------------------------------
  // Abrir "edit"
  // -------------------------------------
  const openEditDialog = (id: number): void => {
    setDialogMode("edit");
    setSelectedProfId(id);
    setDialogOpen(true);
  };

  // -------------------------------------
  // Submeter formulário (create/edit)
  // -------------------------------------
  const handleSubmitProfessional = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!profCPF || !profName || !profEmail || !profPassword || !profBirthDate) {
      alert("CPF, Nome, Email, Senha e Data de Nascimento são obrigatórios.");
      return;
    }

    if (dialogMode === "create") {
      const newId = professionals.length > 0
        ? professionals[professionals.length - 1].id + 1
        : 1;
      const newProf: Professional = {
        id: newId,
        cpf: profCPF,
        name: profName,
        email: profEmail,
        password: profPassword,
        phone: profPhone,
        gender: profGender,
        birthDate: profBirthDate,
        active: true,
        role: profRole,
        registrationDate: new Date().toISOString().split("T")[0],
      };
      setProfessionals((prev) => [...prev, newProf]);
    } else {
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === selectedProfId
            ? {
                ...p,
                cpf: profCPF,
                name: profName,
                email: profEmail,
                // se o password estiver vazio, mantemos o anterior
                password: profPassword ? profPassword : p.password,
                phone: profPhone,
                gender: profGender,
                birthDate: profBirthDate,
                role: profRole,
              }
            : p
        )
      );
    }

    setDialogOpen(false);
    clearForm();
  };

  // -------------------------------------
  // Excluir
  // -------------------------------------
  const openDeleteAlert = (professional: Professional): void => {
    setProfToDelete(professional);
    setAlertOpen(true);
  };

  const handleConfirmDelete = (): void => {
    if (profToDelete) {
      setProfessionals((prev) => prev.filter((p) => p.id !== profToDelete.id));
    }
    setAlertOpen(false);
    setProfToDelete(null);
  };

  // -------------------------------------
  // Filtro
  // -------------------------------------
  const filteredProfessionals = professionals.filter((professional) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      professional.name.toLowerCase().includes(term) ||
      professional.cpf.toLowerCase().includes(term) ||
      professional.email.toLowerCase().includes(term) ||
      professional.phone.toLowerCase().includes(term) ||
      professional.role.toLowerCase().includes(term);

    const matchesDate =
      (!registrationFrom || professional.registrationDate >= registrationFrom) &&
      (!registrationTo || professional.registrationDate <= registrationTo);

    const matchesRole =
      !roleFilter || roleFilter === "" || professional.role === roleFilter;

    return matchesSearch && matchesDate && matchesRole;
  });

  return (
    <>
      {/* Header + TopNav */}
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        {/* Título */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold font-quicksand">
            Gerenciamento de Profissionais
          </h1>
        </div>

        {/* Filtros */}
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
            {/* Cargo Filter (visual melhorado) */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md shadow-sm focus:outline-none font-quicksand"
            >
              <option value="">Todos os Cargos</option>
              <option value="Médico">Médico</option>
              <option value="Enfermeiro">Enfermeiro</option>
              <option value="Recepcionista">Recepcionista</option>
              <option value="Funcionário">Funcionário</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" onClick={openCreateDialog}>
              Adicionar Profissional
            </Button>

            {/* Botão: Gerenciar Acessos */}
            <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Gerenciar Acessos</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-lg p-6">
                <DialogHeader>
                  <DialogTitle>Gerenciar Acessos</DialogTitle>
                  <DialogDescription>
                    Selecione o cargo e as funcionalidades permitidas.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveAccesses} className="space-y-4">
                  <div>
                    <label
                      htmlFor="cargo"
                      className="block text-sm font-quicksand mb-1"
                    >
                      Cargo:
                    </label>
                    <select
                      id="cargo"
                      name="cargo"
                      value={selectedAccessRole}
                      onChange={(e) => setSelectedAccessRole(e.target.value)}
                      className="px-2 py-1 border rounded-md shadow-sm font-quicksand focus:outline-none"
                    >
                      <option value="Médico">Médico</option>
                      <option value="Enfermeiro">Enfermeiro</option>
                      <option value="Recepcionista">Recepcionista</option>
                      <option value="Funcionário">Funcionário</option>
                    </select>
                  </div>
                  <fieldset>
                    <legend className="block text-sm font-quicksand mb-2">
                      Funcionalidades Permitidas
                    </legend>
                    <div className="space-y-1">
                      {ALL_ACCESS_OPTIONS.map((access) => (
                        <label
                          key={access}
                          className="flex items-center space-x-2 capitalize"
                        >
                          <input
                            type="checkbox"
                            value={access}
                            checked={allowedAccesses.includes(access)}
                            onChange={() => handleAccessCheckboxChange(access)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{access}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <DialogFooter>
                    <Button
                      size="sm"
                      type="submit"
                      className="bg-green-600 text-white shadow-sm"
                    >
                      Salvar Acessos
                    </Button>
                    <DialogClose asChild>
                      <Button size="sm" variant="outline" className="shadow-sm">
                        Cancelar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Card + Tabela */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-quicksand">
              Profissionais Cadastrados
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Abaixo está a lista de profissionais do sistema.
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
                      Cargo
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
                      Cadastro
                    </TableHead>
                    <TableHead className="px-2 py-2 text-left font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((prof) => (
                    <TableRow
                      key={prof.id}
                      className="border-b last:border-0 even:bg-muted/25 hover:bg-muted/50"
                    >
                      <TableCell className="px-2 py-2 align-middle">
                        {prof.name}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {prof.cpf}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {prof.role}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                        {new Date(prof.birthDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {prof.email}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        {prof.phone}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                        {new Date(prof.registrationDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="px-2 py-2 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(prof.id)}
                          >
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteAlert(prof)}
                              >
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProfessionals.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="px-2 py-4 text-center text-muted-foreground"
                      >
                        Nenhum profissional encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption className="text-sm text-muted-foreground mt-2">
                  Total de {filteredProfessionals.length} profissional(is).
                </TableCaption>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* --- Dialog: Create/Edit Professional --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[800px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? "Adicionar Profissional"
                : "Editar Profissional"}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos obrigatórios e clique em &quot;Salvar&quot;.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitProfessional}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* CPF */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  type="text"
                  id="cpf"
                  value={profCPF}
                  onChange={(e) => setProfCPF(formatCPF(e.target.value))}
                  required
                />
              </div>
              {/* Nome */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  type="text"
                  id="name"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  required
                />
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  type="email"
                  id="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  required
                />
              </div>
              {/* Senha */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  type="password"
                  id="password"
                  value={profPassword}
                  onChange={(e) => setProfPassword(e.target.value)}
                  required={dialogMode === "create"} 
                />
              </div>
              {/* Telefone */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  type="text"
                  id="phone"
                  value={profPhone}
                  onChange={(e) => setProfPhone(formatPhone(e.target.value))}
                />
              </div>
              {/* Data de Nascimento */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  type="date"
                  id="birthDate"
                  value={profBirthDate}
                  onChange={(e) => setProfBirthDate(e.target.value)}
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
                  value={profGender}
                  onChange={(e) => setProfGender(e.target.value)}
                />
              </div>
              {/* Cargo */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="role">Cargo</Label>
                <select
                  id="role"
                  value={profRole}
                  onChange={(e) => setProfRole(e.target.value)}
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none"
                >
                  <option value="Médico">Médico</option>
                  <option value="Enfermeiro">Enfermeiro</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Funcionário">Funcionário</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {dialogMode === "create" ? "Adicionar" : "Salvar"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- AlertDialog: Delete Professional --- */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja excluir este profissional?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. O profissional será removido
              permanentemente.
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

export default AdminPage;
