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
  prof_senha?: string;
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
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedProfId, setSelectedProfId] = useState<number | null>(null);
  const [profCPF, setProfCPF] = useState("");
  const [profName, setProfName] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profPassword, setProfPassword] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profGender, setProfGender] = useState("");
  const [profBirthDate, setProfBirthDate] = useState("");
  const [profCargo, setProfCargo] = useState<number | "">("");
  const [profCRM, setProfCRM] = useState("");
  const [profEspecialidade, setProfEspecialidade] = useState<number | "">("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<Professional | null>(null);
  const [cargoDialogOpen, setCargoDialogOpen] = useState(false);
  const [cargoName, setCargoName] = useState("");
  const [cargoEditingId, setCargoEditingId] = useState<number | null>(null);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedAccessRole, setSelectedAccessRole] = useState("");
  const [allowedAccesses, setAllowedAccesses] = useState<string[]>([]);
  const ALL_ACCESS_OPTIONS = ["consultas", "pacientes", "admin"];

  // Carrega profissionais, cargos e especialidades
  useEffect(() => {
    fetch("/api/profissionais")
      .then((r) => r.json())
      .then((data: Professional[]) => setProfessionals(data))
      .catch(() => {});
    fetch("/api/cargos")
      .then((r) => r.json())
      .then((data: Cargo[]) => setCargos(data))
      .catch(() => {});
    fetch("/api/especialidades")
      .then((r) => r.json())
      .then((data: Especialidade[]) => setEspecialidades(data))
      .catch(() => {});
  }, []);

  // Ao editar, carrega dados do profissional
  useEffect(() => {
    if (dialogMode === "edit" && selectedProfId !== null) {
      const p = professionals.find((x) => x.id_profissional === selectedProfId);
      if (p) {
        setProfCPF(p.prof_cpf);
        setProfName(p.prof_nome);
        setProfEmail(p.prof_email);
        setProfPassword("");
        setProfPhone(p.prof_telefone);
        setProfGender(p.prof_genero);
        setProfBirthDate(p.prof_data_nascimento);
        setProfCargo(p.id_cargo);
        // Se for Médico, carrega CRM e Especialidade
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

  // Função para buscar o nome do cargo a partir do id
  function buscarCargoNome(idCargo: number | "") {
    if (idCargo === "") return "";
    const c = cargos.find((x) => x.id_cargo === Number(idCargo));
    return c ? c.cargo_nome : "";
  }

  function cargoEhMedico() {
    const nome = buscarCargoNome(profCargo).toLowerCase();
    return nome === "médico";
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedProfId(null);
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

  // Em vez de remover definitivamente, envia o DELETE (endpoint que inativa o profissional)
  function handleConfirmDelete() {
    if (!profToDelete) return;
    fetch(`/api/profissionais/${profToDelete.id_profissional}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error();
        // Atualiza o state removendo os inativos
        setProfessionals((prev) =>
          prev.filter((x) => x.id_profissional !== profToDelete.id_profissional)
        );
        setAlertOpen(false);
        setProfToDelete(null);
      })
      .catch(() => {});
  }

  // Filtra somente profissionais ativos
  const filteredProfessionals = professionals.filter((p) => {
    if (!p.prof_ativo) return false; // Não exibe inativos
    const term = searchTerm.toLowerCase();
    const b =
      p.prof_nome.toLowerCase().includes(term) ||
      p.prof_cpf.toLowerCase().includes(term) ||
      p.prof_email.toLowerCase().includes(term) ||
      (p.cargo_nome || "").toLowerCase().includes(term);
    const f =
      !roleFilter ||
      (p.cargo_nome || "").toLowerCase() === roleFilter.toLowerCase();
    return b && f;
  });

  function handleSubmitProfessional(e: React.FormEvent) {
    e.preventDefault();
    if (!profCPF || !profName || !profEmail || !profBirthDate) return;
    if (dialogMode === "create") {
      if (!profPassword) return;
      const payload = {
        prof_nome: profName,
        prof_cpf: profCPF,
        prof_email: profEmail,
        prof_senha: profPassword,
        prof_telefone: profPhone,
        prof_genero: profGender,
        prof_data_nascimento: profBirthDate,
        id_cargo: profCargo !== "" ? Number(profCargo) : null,
      };
      fetch("/api/profissionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((d) => {
          const novo = {
            id_profissional: d.id_profissional,
            prof_nome: profName,
            prof_cpf: profCPF,
            prof_email: profEmail,
            prof_senha: profPassword,
            prof_telefone: profPhone,
            prof_genero: profGender,
            prof_data_nascimento: profBirthDate,
            prof_ativo: true,
            id_cargo: profCargo !== "" ? Number(profCargo) : 0,
            cargo_nome: buscarCargoNome(profCargo),
          };
          setProfessionals((prev) => [...prev, novo]);
          if (cargoEhMedico()) {
            const medPayload = {
              crm: profCRM,
              id_profissional: d.id_profissional,
              id_especialidade:
                profEspecialidade !== "" ? Number(profEspecialidade) : null,
            };
            if (!medPayload.crm || !medPayload.id_especialidade) {
              alert(
                "Para profissionais com cargo Médico, CRM e Especialidade são obrigatórios!"
              );
              return;
            }
            fetch("/api/medicos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(medPayload),
            }).catch(() => {});
          }
          setDialogOpen(false);
        })
        .catch(() => {});
    } else {
      if (!selectedProfId) return;
      const payloadEdit = {
        prof_nome: profName,
        prof_cpf: profCPF,
        prof_email: profEmail,
        prof_senha: profPassword,
        prof_telefone: profPhone,
        prof_genero: profGender,
        prof_data_nascimento: profBirthDate,
        id_cargo: profCargo !== "" ? Number(profCargo) : null,
      };
      fetch(`/api/profissionais/${selectedProfId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadEdit),
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(() => {
          setProfessionals((prev) =>
            prev.map((x) =>
              x.id_profissional === selectedProfId
                ? {
                    ...x,
                    prof_cpf: profCPF,
                    prof_nome: profName,
                    prof_email: profEmail,
                    prof_senha: profPassword ? profPassword : x.prof_senha,
                    prof_telefone: profPhone,
                    prof_genero: profGender,
                    prof_data_nascimento: profBirthDate,
                    id_cargo: profCargo !== "" ? Number(profCargo) : 0,
                    cargo_nome: buscarCargoNome(profCargo),
                  }
                : x
            )
          );
          if (cargoEhMedico()) {
            fetch(`/api/medicos?profissional=${selectedProfId}`)
              .then((r) => r.json())
              .then((meds: Medico[]) => {
                const payload = {
                  crm: profCRM,
                  id_profissional: selectedProfId,
                  id_especialidade:
                    profEspecialidade !== "" ? Number(profEspecialidade) : null,
                };
                if (!payload.crm || !payload.id_especialidade) {
                  alert(
                    "Para profissionais com cargo Médico, CRM e Especialidade são obrigatórios!"
                  );
                  return;
                }
                if (meds.length) {
                  fetch(`/api/medicos/${meds[0].id_medico}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  }).catch(() => {});
                } else {
                  fetch("/api/medicos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  }).catch(() => {});
                }
              })
              .catch(() => {});
          } else {
            fetch(`/api/medicos?profissional=${selectedProfId}`)
              .then((r) => r.json())
              .then((meds: Medico[]) => {
                if (meds.length) {
                  const mid = meds[0].id_medico;
                  fetch(`/api/medicoss/${mid}`, { method: "DELETE" }).catch(() => {});
                }
              })
              .catch(() => {});
          }
          setDialogOpen(false);
        })
        .catch(() => {});
    }
  }

  function handleAccessCheckboxChange(a: string) {
    if (allowedAccesses.includes(a)) {
      setAllowedAccesses((prev) => prev.filter((x) => x !== a));
    } else {
      setAllowedAccesses((prev) => [...prev, a]);
    }
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
    if (!cargoEditingId) {
      fetch("/api/cargos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo_nome: cargoName, id_profissional: 1 }),
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((d) => {
          setCargos((prev) => [...prev, { id_cargo: d.id_cargo, cargo_nome: cargoName }]);
          setCargoName("");
        })
        .catch(() => {});
    } else {
      fetch(`/api/cargos/${cargoEditingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo_nome: cargoName, id_profissional: 1 }),
      })
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(() => {
          setCargos((prev) =>
            prev.map((x) =>
              x.id_cargo === cargoEditingId ? { ...x, cargo_nome: cargoName } : x
            )
          );
          setCargoEditingId(null);
          setCargoName("");
        })
        .catch(() => {});
    }
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
        setCargos((prev) => prev.filter((c) => c.id_cargo !== id));
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
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold font-quicksand">Gerenciamento de Profissionais</h1>
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
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md shadow-sm focus:outline-none"
            >
              <option value="">Todos os Cargos</option>
              {cargos.map((c) => (
                <option key={c.id_cargo} value={c.cargo_nome}>
                  {c.cargo_nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={openCreateDialog}>Adicionar Profissional</Button>
            <Button onClick={openCargoDialog}>Gerenciar Cargos</Button>
            <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
              <DialogTrigger asChild>
                <Button>Gerenciar Acessos</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg rounded-lg p-6">
                <DialogHeader>
                  <DialogTitle>Gerenciar Acessos</DialogTitle>
                  <DialogDescription>Selecione o cargo e funcionalidades.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveAccesses} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Cargo</label>
                    <select
                      value={selectedAccessRole}
                      onChange={(e) => setSelectedAccessRole(e.target.value)}
                      className="px-2 py-1 border rounded-md"
                    >
                      {cargos.map((c) => (
                        <option key={c.id_cargo} value={c.cargo_nome}>
                          {c.cargo_nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <fieldset>
                    <legend className="block text-sm mb-2">Funcionalidades</legend>
                    <div className="space-y-1">
                      {ALL_ACCESS_OPTIONS.map((ac) => (
                        <label key={ac} className="flex items-center space-x-2 capitalize">
                          <input
                            type="checkbox"
                            checked={allowedAccesses.includes(ac)}
                            onChange={() => handleAccessCheckboxChange(ac)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{ac}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <DialogFooter>
                    <Button type="submit" size="sm">
                      Salvar
                    </Button>
                    <DialogClose asChild>
                      <Button size="sm" variant="outline">
                        Cancelar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-quicksand">Profissionais Cadastrados</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Abaixo está a lista de profissionais ativos
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
                  {filteredProfessionals.map((p) => (
                    <TableRow key={p.id_profissional}>
                      <TableCell>{p.prof_nome}</TableCell>
                      <TableCell>{p.prof_cpf}</TableCell>
                      <TableCell>{p.cargo_nome}</TableCell>
                      <TableCell>
  {new Date(p.prof_data_nascimento).toISOString().substring(0, 10).split("-").reverse().join("/")}
</TableCell>

                      <TableCell>{p.prof_email}</TableCell>
                      <TableCell>{p.prof_telefone}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(p.id_profissional)}
                          >
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setProfToDelete(p);
                                  setAlertOpen(true);
                                }}
                              >
                                Inativar
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProfessionals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-4 text-center">
                        Nenhum profissional encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption className="text-sm text-muted-foreground mt-2">
                  Total de {filteredProfessionals.length} profissional(is)
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
              {dialogMode === "create" ? "Adicionar Profissional" : "Editar Profissional"}
            </DialogTitle>
            <DialogDescription>Preencha os campos obrigatórios</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitProfessional}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>CPF *</Label>
                <Input value={profCPF} onChange={(e) => setProfCPF(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Nome *</Label>
                <Input value={profName} onChange={(e) => setProfName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Senha {dialogMode === "create" && "*"}</Label>
                <Input
                  type="password"
                  value={profPassword}
                  onChange={(e) => setProfPassword(e.target.value)}
                  required={dialogMode === "create"}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Telefone</Label>
                <Input value={profPhone} onChange={(e) => setProfPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  value={profBirthDate}
                  onChange={(e) => setProfBirthDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Gênero</Label>
                <Input value={profGender} onChange={(e) => setProfGender(e.target.value)} />
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
                      value={profCRM}
                      onChange={(e) => setProfCRM(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Especialidade *</Label>
                    <select
                      className="px-3 py-2 border rounded-md shadow-sm"
                      value={profEspecialidade}
                      onChange={(e) =>
                        setProfEspecialidade(e.target.value ? Number(e.target.value) : "")
                      }
                      required
                      style={{ maxHeight: "150px", overflowY: "auto" }}
                    >
                      <option value="">Selecione...</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id_especialidade} value={esp.id_especialidade}>
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
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar Profissional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação inativa o profissional (não poderá ser desfeita)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Inativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={cargoDialogOpen} onOpenChange={setCargoDialogOpen}>
        <DialogContent className="max-w-[700px] w-full">
          <DialogHeader>
            <DialogTitle>Gerenciar Cargos</DialogTitle>
            <DialogDescription>Crie, edite ou exclua cargos</DialogDescription>
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
                        <Button size="sm" variant="outline" onClick={() => handleEditCargo(c)}>
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
              <Input value={cargoName} onChange={(e) => setCargoName(e.target.value)} />
              <DialogFooter>
                <Button type="submit">
                  {cargoEditingId ? "Salvar alterações" : "Adicionar Cargo"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
