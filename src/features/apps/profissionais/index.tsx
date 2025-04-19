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
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

interface Cargo {
  id_cargo: number;
  cargo_nome: string;
}

interface Especialidade {
  id_especialidade: number;
  espec_nome: string;
}

interface Professional {
  id_profissional: number;
  prof_nome: string;
  prof_cpf: string;
  prof_email: string;
  prof_telefone: string;
  prof_genero: string;
  prof_data_nascimento: string;
  prof_ativo: boolean;
  id_cargo: number;
  cargo_nome?: string;
}

interface Medico {
  id_medico: number;
  crm: string;
  id_profissional: number;
  id_especialidade: number;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  {
    title: "Consultas",
    href: "/consultasgestao",
    isActive: true,
    disabled: false,
  },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

export default function ProfissionaisPage() {
  // Estados principais
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");

  // Diálogo de criar/editar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] =
    useState<"create" | "edit">("create");
  const [selectedProfId, setSelectedProfId] =
    useState<number | null>(null);

  // Campos do formulário
  const [profCPF, setProfCPF] = useState("");
  const [profName, setProfName] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profPassword, setProfPassword] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profGender, setProfGender] = useState("");
  const [profBirthDate, setProfBirthDate] = useState("");
  const [profCargo, setProfCargo] = useState<number | "">("");
  const [profCRM, setProfCRM] = useState("");
  const [profEspecialidade, setProfEspecialidade] = useState<
    number | ""
  >("");

  // Diálogo de inativar
  const [alertOpen, setAlertOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(
    null
  );

  // Diálogo de cargos
  const [cargoDialogOpen, setCargoDialogOpen] = useState(false);
  const [cargoName, setCargoName] = useState("");
  const [cargoEditingId, setCargoEditingId] =
    useState<number | null>(null);

  // Diálogo de acessos
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedAccessRole, setSelectedAccessRole] = useState("");
  const [allowedAccesses, setAllowedAccesses] = useState<string[]>([]);
  const ALL_ACCESS_OPTIONS = ["consultas", "pacientes", "admin"];

  // Função para buscar profissionais no banco
  function fetchProfessionals() {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (roleFilter) params.append("cargo", roleFilter);
    fetch(`/api/profissionais?${params.toString()}`)
      .then((r) => r.json())
      .then((data: Professional[]) => setProfessionals(data))
      .catch(() => {});
  }

  // Carrega dados ao montar e sempre que searchTerm ou roleFilter mudam
  useEffect(() => {
    fetchProfessionals();
  }, [searchTerm, roleFilter]);

  // Carrega cargos e especialidades uma vez
  useEffect(() => {
    fetch("/api/cargos")
      .then((r) => r.json())
      .then(setCargos)
      .catch(() => {});
    fetch("/api/especialidades")
      .then((r) => r.json())
      .then(setEspecialidades)
      .catch(() => {});
  }, []);

  // Quando abre edição, pré-carrega campos
  useEffect(() => {
    if (dialogMode === "edit" && selectedProfId !== null) {
      const p = professionals.find(
        (x) => x.id_profissional === selectedProfId
      );
      if (p) {
        setProfCPF(p.prof_cpf);
        setProfName(p.prof_nome);
        setProfEmail(p.prof_email);
        setProfPassword("");
        setProfPhone(p.prof_telefone);
        setProfGender(p.prof_genero);
        setProfBirthDate(p.prof_data_nascimento);
        setProfCargo(p.id_cargo);
        setProfCRM("");
        setProfEspecialidade("");
        if ((p.cargo_nome || "").toLowerCase() === "médico") {
          fetch(`/api/medicos?profissional=${selectedProfId}`)
            .then((r) => r.json())
            .then((meds: Medico[]) => {
              if (meds.length) {
                setProfCRM(meds[0].crm);
                setProfEspecialidade(meds[0].id_especialidade);
              }
            })
            .catch(() => {});
        }
      }
    } else {
      // limpa campos ao fechar ou modo create
      setProfCPF("");
      setProfName("");
      setProfEmail("");
      setProfPassword("");
      setProfPhone("");
      setProfGender("");
      setProfBirthDate("");
      setProfCargo("");
      setProfCRM("");
      setProfEspecialidade("");
    }
  }, [dialogMode, selectedProfId, professionals]);

  // Busca nome do cargo por id
  function buscarCargoNome(idCargo: number | ""): string {
    if (idCargo === "") return "";
    const c = cargos.find((x) => x.id_cargo === Number(idCargo));
    return c ? c.cargo_nome : "";
  }

  // Checa se é médico
  function cargoEhMedico(): boolean {
    return buscarCargoNome(profCargo).toLowerCase() === "médico";
  }

  // Ações de UI
  function openCreateDialog() {
    setDialogMode("create");
    setSelectedProfId(null);
    setDialogOpen(true);
  }
  function openEditDialog(id: number) {
    setDialogMode("edit");
    setSelectedProfId(id);
    setDialogOpen(true);
  }
  function openDeleteAlert(p: Professional) {
    setProfToDelete(p);
    setAlertOpen(true);
  }

  // Inativar (DELETE)
  function handleConfirmDelete() {
    if (!profToDelete) return;
    fetch(`/api/profissionais/${profToDelete.id_profissional}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        // refetch para garantir sincronia
        fetchProfessionals();
        setAlertOpen(false);
      })
      .catch(() => {});
  }

  // Reativar (PUT /:id/reativar)
  function handleReactivate(id: number) {
    fetch(`/api/profissionais/${id}/reativar`, {
      method: "PUT",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        fetchProfessionals();
      })
      .catch(() => {});
  }

  // Filtra apenas por status (ativo/inativo)
  const displayedProfessionals = professionals.filter((p) => {
    return (
      statusFilter === "all" ||
      (statusFilter === "active" && p.prof_ativo) ||
      (statusFilter === "inactive" && !p.prof_ativo)
    );
  });

  // Submissão do form create/edit
  function handleSubmitProfessional(e: React.FormEvent) {
    e.preventDefault();
    if (!profCPF || !profName || !profEmail || !profBirthDate) return;
    const url =
      dialogMode === "create"
        ? "/api/profissionais"
        : `/api/profissionais/${selectedProfId}`;
    const method = dialogMode === "create" ? "POST" : "PUT";
    const payload: any = {
      prof_nome: profName,
      prof_cpf: profCPF,
      prof_email: profEmail,
      prof_telefone: profPhone,
      prof_genero: profGender,
      prof_data_nascimento: profBirthDate,
      id_cargo: profCargo !== "" ? Number(profCargo) : null,
    };
    if (dialogMode === "create") {
      if (!profPassword) return;
      payload.prof_senha = profPassword;
    } else if (profPassword) {
      payload.prof_senha = profPassword;
    }
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return dialogMode === "create" ? r.json() : null;
      })
      .then((d) => {
        setDialogOpen(false);
        fetchProfessionals();
      })
      .catch(() => {});
  }

  function handleAccessCheckboxChange(a: string) {
    setAllowedAccesses((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }
  function handleSaveAccesses(e: React.FormEvent) {
    e.preventDefault();
    alert(
      `Acessos salvos para o cargo ${selectedAccessRole}: ${allowedAccesses.join(
        ", "
      )}`
    );
    setAccessDialogOpen(false);
  }

  function openCargoDialog() {
    setCargoDialogOpen(true);
    setCargoEditingId(null);
    setCargoName("");
  }
  function handleEditCargo(c: Cargo) {
    setCargoEditingId(c.id_cargo);
    setCargoName(c.cargo_nome);
  }
  function handleSaveCargo(e: React.FormEvent) {
    e.preventDefault();
    if (!cargoName) return;
    const url = cargoEditingId
      ? `/api/cargos/${cargoEditingId}`
      : "/api/cargos";
    const method = cargoEditingId ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cargo_nome: cargoName, id_profissional: 1 }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setCargoDialogOpen(false);
        setCargoName("");
      })
      .catch(() => {});
  }
  function handleDeleteCargo(id: number) {
    if (!confirm("Deseja excluir este cargo?")) return;
    fetch(`/api/cargos/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_profissional: 1 }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
      })
      .catch(() => {});
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
        <h1 className="text-3xl font-bold font-quicksand">
          Gerenciamento de Profissionais
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-md shadow-sm"
          >
            <option value="">Todos os Cargos</option>
            {cargos.map((c) => (
              <option key={c.id_cargo} value={c.cargo_nome}>
                {c.cargo_nome}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "active" | "inactive" | "all"
              )
            }
            className="px-3 py-2 border rounded-md shadow-sm"
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos</option>
          </select>
          <Button onClick={openCreateDialog}>Adicionar Profissional</Button>
          <Button onClick={openCargoDialog}>Gerenciar Cargos</Button>
          <Dialog
            open={accessDialogOpen}
            onOpenChange={setAccessDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Gerenciar Acessos</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-6">
              <DialogHeader>
                <DialogTitle>Gerenciar Acessos</DialogTitle>
                <DialogDescription>
                  Selecione o cargo e funcionalidades.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSaveAccesses}
                className="space-y-4"
              >
                <Label>Cargo</Label>
                <select
                  value={selectedAccessRole}
                  onChange={(e) =>
                    setSelectedAccessRole(e.target.value)
                  }
                  className="px-2 py-1 border rounded-md"
                >
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.cargo_nome}>
                      {c.cargo_nome}
                    </option>
                  ))}
                </select>
                <fieldset>
                  <legend className="text-sm mb-2">
                    Funcionalidades
                  </legend>
                  {ALL_ACCESS_OPTIONS.map((ac) => (
                    <label
                      key={ac}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={allowedAccesses.includes(ac)}
                        onChange={() =>
                          handleAccessCheckboxChange(ac)
                        }
                      />
                      <span>{ac}</span>
                    </label>
                  ))}
                </fieldset>
                <DialogFooter>
                  <Button type="submit" size="sm">
                    Salvar
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Profissionais Cadastrados</CardTitle>  
            <CardDescription>
              {statusFilter === "all"
                ? `Total: ${displayedProfessionals.length}`
                : statusFilter === "active"
                ? `Ativos: ${displayedProfessionals.length}`
                : `Inativos: ${displayedProfessionals.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Nascimento</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedProfessionals.map((p) => (
                    <TableRow
                      key={p.id_profissional}
                      className={
                        !p.prof_ativo ? "bg-gray-100 opacity-60" : ""
                      }
                    >
                      <TableCell>{p.prof_nome}</TableCell>
                      <TableCell>{p.prof_cpf}</TableCell>
                      <TableCell>{p.cargo_nome}</TableCell>
                      <TableCell>
                        {new Date(p.prof_data_nascimento)
                          .toISOString()
                          .slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("/")}
                      </TableCell>
                      <TableCell>{p.prof_email}</TableCell>
                      <TableCell>{p.prof_telefone}</TableCell>
                      <TableCell>
                        {p.prof_ativo ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openEditDialog(p.id_profissional)
                              }
                            >
                              Editar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    openDeleteAlert(p)
                                  }
                                >
                                  Inativar
                                </Button>
                              </AlertDialogTrigger>
                            </AlertDialog>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReactivate(p.id_profissional)
                            }
                          >
                            Reativar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {displayedProfessionals.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-4 text-center"
                      >
                        Nenhum profissional encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption className="text-sm text-muted-foreground mt-2">
                  Total de {displayedProfessionals.length} profissional(is)
                </TableCaption>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[800px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? "Adicionar Profissional"
                : "Editar Profissional"}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos obrigatórios
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitProfessional}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>CPF *</Label>
                <Input
                  required
                  value={profCPF}
                  onChange={(e) => setProfCPF(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Nome *</Label>
                <Input
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  required
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Senha {dialogMode === "create" && "*"}</Label>
                <Input
                  type="password"
                  required={dialogMode === "create"}
                  value={profPassword}
                  onChange={(e) => setProfPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Telefone</Label>
                <Input
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  required
                  value={profBirthDate}
                  onChange={(e) => setProfBirthDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Gênero</Label>
                <Input
                  value={profGender}
                  onChange={(e) => setProfGender(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Cargo</Label>
                <select
                  className="px-3 py-2 border rounded-md shadow-sm"
                  value={profCargo}
                  onChange={(e) => setProfCargo(Number(e.target.value))}
                >
                  <option value="">Selecione...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>
                      {c.cargo_nome}
                    </option>
                  ))}
                </select>
              </div>
              {cargoEhMedico() && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>CRM *</Label>
                    <Input
                      required
                      value={profCRM}
                      onChange={(e) => setProfCRM(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Especialidade *</Label>
                    <select
                      required
                      className="px-3 py-2 border rounded-md shadow-sm"
                      value={profEspecialidade}
                      onChange={(e) =>
                        setProfEspecialidade(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                    >
                      <option value="">Selecione...</option>
                      {especialidades.map((esp) => (
                        <option
                          key={esp.id_especialidade}
                          value={esp.id_especialidade}
                        >
                          {esp.espec_nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
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

      {/* Inativação AlertDialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar Profissional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação tornará o profissional inativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Gerenciar Cargos Dialog */}
      <Dialog open={cargoDialogOpen} onOpenChange={setCargoDialogOpen}>
        <DialogContent className="max-w-[700px] w-full">
          <DialogHeader>
            <DialogTitle>Gerenciar Cargos</DialogTitle>
            <DialogDescription>
              Crie, edite ou exclua cargos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[200px]">
              <Table className="w-full table-auto text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargos.map((c) => (
                    <TableRow key={c.id_cargo}>
                      <TableCell>{c.id_cargo}</TableCell>
                      <TableCell>{c.cargo_nome}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCargo(c)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCargo(c.id_cargo)}
                          className="ml-2"
                        >
                          Inativar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cargos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Nenhum cargo cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            <form onSubmit={handleSaveCargo} className="space-y-2">
              <Label>Nome do Cargo</Label>
              <Input
                value={cargoName}
                onChange={(e) => setCargoName(e.target.value)}
              />
              <DialogFooter>
                <Button type="submit">
                  {cargoEditingId
                    ? "Salvar alterações"
                    : "Adicionar Cargo"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
