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

interface Cargo { id_cargo: number; cargo_nome: string }
interface Especialidade { id_especialidade: number; espec_nome: string }
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
  cargo_nome: string;
  crm?: string;
  id_especialidade?: number;
  coren?: string;
}

const CPF_RE = /^\d{11}$/;
const TEL_RE = /^\d{10,11}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COREN_RE = /^\d{4,7}(?:\/[A-Z]{2})?$/;
const DEFAULT_PASSWORD_MASK = "********";

const validarCPF = (c: string) => {
  const cpf = c.replace(/\D/g, "");
  if (!CPF_RE.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (m: number) => {
    let s = 0;
    for (let i = 0; i < m; i++) s += +cpf[i] * (m + 1 - i);
    return ((s * 10) % 11) % 10;
  };
  return calc(9) === +cpf[9] && calc(10) === +cpf[10];
};
const formatCPF = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
    .slice(0, 14);
const formatPhone = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
const isPastOrToday = (d: string) => new Date(d) <= new Date();

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [dlgOpen, setDlgOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selId, setSelId] = useState<number | null>(null);
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [fone, setFone] = useState("");
  const [data, setData] = useState("");
  const [genero, setGenero] = useState("");
  const [cargoId, setCargoId] = useState<number | "">("");
  const [crm, setCrm] = useState("");
  const [espId, setEspId] = useState<number | "">("");
  const [coren, setCoren] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Professional | null>(null);

  const load = () =>
    fetch("/api/profissionais").then((r) => r.json()).then(setProfessionals);
  const loadCargos = () =>
    fetch("/api/cargos").then((r) => r.json()).then(setCargos);
  useEffect(() => { load(); }, []);
  useEffect(() => { loadCargos(); }, []);
  useEffect(() => {
    fetch("/api/especialidades").then((r) => r.json()).then(setEspecialidades);
  }, []);

  const cargoNome = (id: number | "") =>
    id === "" ? "" : cargos.find((c) => c.id_cargo === +id)?.cargo_nome ?? "";
  const ehMedico = cargoNome(cargoId).toLowerCase() === "médico";
  const ehEnfermeiro = cargoNome(cargoId).toLowerCase() === "enfermeiro";

  const check = (f: string, v: string) => {
    let m = "";
    switch (f) {
      case "cpf":
        if (!v) m = "CPF é obrigatório.";
        else if (!validarCPF(v)) m = "CPF inválido.";
        break;
      case "nome":
        if (!v.trim()) m = "Nome é obrigatório.";
        break;
      case "email":
        if (v && !EMAIL_RE.test(v)) m = "E-mail inválido.";
        break;
      case "fone":
        if (v && !TEL_RE.test(v.replace(/\D/g, ""))) m = "Telefone inválido.";
        break;
      case "data":
        if (!v) m = "Data de nascimento é obrigatória.";
        else if (!isPastOrToday(v)) m = "Data não pode ser futura.";
        break;
      case "senha":
        if (mode === "create" && !v) m = "Senha é obrigatória.";
        else if (
          mode === "edit" &&
          v !== DEFAULT_PASSWORD_MASK &&
          v.length > 0 &&
          v.length < 6
        )
          m = "Senha deve ter ao menos 6 caracteres.";
        break;
      case "crm":
        if (ehMedico && !v) m = "CRM é obrigatório.";
        break;
      case "coren":
        if (ehEnfermeiro && !v) m = "COREN é obrigatório.";
        else if (v && !COREN_RE.test(v)) m = "COREN inválido.";
        break;
    }
    setErrs((p) => ({ ...p, [f]: m }));
  };

  const h =
    (f: string, set: (v: string) => void, fmt?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = fmt ? fmt(e.target.value) : e.target.value;
      set(v);
      check(f, v);
    };

  const reset = () => {
    setCpf("");
    setNome("");
    setEmail("");
    setSenha("");
    setFone("");
    setData("");
    setGenero("");
    setCargoId("");
    setCrm("");
    setEspId("");
    setCoren("");
    setErrs({});
  };

  const openNew = () => {
    reset();
    setMode("create");
    setSelId(null);
    setDlgOpen(true);
  };

  const openEdit = (p: Professional) => {
    reset();
    setCpf(p.prof_cpf);
    setNome(p.prof_nome);
    setEmail(p.prof_email);
    setFone(p.prof_telefone);
    setData(new Date(p.prof_data_nascimento).toISOString().slice(0, 10));
    setGenero(p.prof_genero);
    setCargoId(p.id_cargo);
    setCrm(p.crm || "");
    setEspId(p.id_especialidade || "");
    setCoren(p.coren || "");
    setSenha(DEFAULT_PASSWORD_MASK);
    setMode("edit");
    setSelId(p.id_profissional);
    setDlgOpen(true);
  };

  const valid = () =>
    cpf &&
    nome &&
    data &&
    cargoId !== "" &&
    !Object.values(errs).some(Boolean) &&
    (mode === "create" || senha === DEFAULT_PASSWORD_MASK || senha.length >= 6) &&
    (!ehMedico || (crm && espId)) &&
    (!ehEnfermeiro || coren);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    ["cpf", "nome", "email", "fone", "data", "senha", "crm", "coren"].forEach(
      (f) => {
        const map: any = { cpf, nome, email, fone, data, senha, crm, coren };
        check(f, map[f]);
      }
    );
    if (!valid()) return;
    const body: any = {
      prof_nome: nome,
      prof_cpf: cpf.replace(/\D/g, ""),
      prof_email: email,
      prof_telefone: fone,
      prof_genero: genero,
      prof_data_nascimento: data,
      id_cargo: +cargoId,
    };
    if (mode === "create" || senha !== DEFAULT_PASSWORD_MASK) {
      body.prof_senha = senha;
    }
    if (ehMedico) {
      body.crm = crm;
      body.id_especialidade = espId;
    }
    if (ehEnfermeiro) {
      body.coren = coren;
    }
    const url =
      mode === "create"
        ? "/api/profissionais"
        : `/api/profissionais/${selId}`;
    const ok = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.ok);
    if (!ok) {
      alert("Erro ao salvar, tente novamente.");
      return;
    }
    setDlgOpen(false);
    load();
  };

  const del = async () => {
    if (!toDelete) return;
    await fetch(
      `/api/profissionais/${toDelete.id_profissional}`,
      { method: "DELETE" }
    );
    setAlertOpen(false);
    load();
  };

  return (
    <>
      <Header>
        <TopNav
          links={[
            { title: "Início", href: "/", isActive: true, disabled: false },
            {
              title: "Consultas",
              href: "/consultasgestao",
              isActive: false,
              disabled: false,
            },
            {
              title: "Pacientes",
              href: "/pacientes",
              isActive: true,
              disabled: false,
            },
          ]}
        />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>
      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Profissionais</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="w-48"
          />
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "active" | "inactive" | "all")
            }
            className="px-3 py-2 border rounded-md"
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos</option>
          </select>
          <Button onClick={openNew}>Adicionar Profissional</Button>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              {status === "all"
                ? `Total: ${professionals.length}`
                : status === "active"
                ? `Ativos: ${professionals.filter((p) => p.prof_ativo).length}`
                : `Inativos: ${
                    professionals.filter((p) => !p.prof_ativo).length
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Nasc.</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals
                    .filter(
                      (p) =>
                        status === "all" ||
                        (status === "active" ? p.prof_ativo : !p.prof_ativo)
                    )
                    .filter(
                      (p) =>
                        p.prof_nome
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        p.prof_cpf.includes(search.replace(/\D/g, ""))
                    )
                    .map((p) => (
                      <TableRow
                        key={p.id_profissional}
                        className={!p.prof_ativo ? "bg-gray-100" : ""}
                      >
                        <TableCell>{p.prof_nome}</TableCell>
                        <TableCell>{formatCPF(p.prof_cpf)}</TableCell>
                        <TableCell>{p.cargo_nome}</TableCell>
                        <TableCell>
                          {new Date(
                            p.prof_data_nascimento
                          ).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{p.prof_email}</TableCell>
                        <TableCell>
                          {formatPhone(p.prof_telefone)}
                        </TableCell>
                        <TableCell>
                          {p.prof_ativo ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(p)}
                            >
                              Editar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                fetch(
                                  `/api/profissionais/${p.id_profissional}/reativar`,
                                  { method: "PUT" }
                                ).then(load)
                              }
                            >
                              Reativar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="ml-2"
                            onClick={() => {
                              setToDelete(p);
                              setAlertOpen(true);
                            }}
                          >
                            Inativar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Adicionar" : "Editar"} Profissional
            </DialogTitle>
            <DialogDescription>Campos * são obrigatórios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>CPF *</Label>
                <Input value={formatCPF(cpf)} onChange={h("cpf", setCpf, formatCPF)} />
                {errs.cpf && <p className="text-red-600 text-sm">{errs.cpf}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Nome *</Label>
                <Input value={nome} onChange={h("nome", setNome)} />
                {errs.nome && <p className="text-red-600 text-sm">{errs.nome}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>E-mail</Label>
                <Input value={email} onChange={h("email", setEmail)} />
                {errs.email && <p className="text-red-600 text-sm">{errs.email}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Senha {mode === "create" && "*"}</Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={h("senha", setSenha)}
                />
                {errs.senha && (
                  <p className="text-red-600 text-sm">{errs.senha}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Telefone</Label>
                <Input
                  value={formatPhone(fone)}
                  onChange={h("fone", setFone, formatPhone)}
                />
                {errs.fone && <p className="text-red-600 text-sm">{errs.fone}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Data de Nascimento *</Label>
                <Input type="date" value={data} onChange={h("data", setData)} />
                {errs.data && <p className="text-red-600 text-sm">{errs.data}</p>}
              </div>
              <div className="flex flex-col gap-1">
  <Label>Gênero</Label>
  <select
    className="px-3 py-2 border rounded-md"
    value={genero}
    onChange={(e) => setGenero(e.target.value)}
  >
    <option value="">Selecione…</option>
    <option value="M">Masculino</option>
    <option value="F">Feminino</option>
    <option value="O">Outros</option>
  </select>
</div>
              <div className="flex flex-col gap-1">
                <Label>Cargo *</Label>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={cargoId}
                  onChange={(e) => setCargoId(+e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>
                      {c.cargo_nome}
                    </option>
                  ))}
                </select>
              </div>
              {ehMedico && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>CRM *</Label>
                    <Input value={crm} onChange={h("crm", setCrm)} />
                    {errs.crm && (
                      <p className="text-red-600 text-sm">{errs.crm}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Especialidade *</Label>
                    <select
                      className="px-3 py-2 border rounded-md"
                      value={espId}
                      onChange={(e) => setEspId(+e.target.value)}
                    >
                      <option value="">Selecione…</option>
                      {especialidades.map((e) => (
                        <option key={e.id_especialidade} value={e.id_especialidade}>
                          {e.espec_nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {ehEnfermeiro && (
                <div className="flex flex-col gap-1">
                  <Label>COREN *</Label>
                  <Input value={coren} onChange={h("coren", setCoren)} />
                  {errs.coren && (
                    <p className="text-red-600 text-sm">{errs.coren}</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!valid()}>
                Salvar
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
          </AlertDialogHeader>
          <AlertDialogDescription>
            Você poderá reativá-lo depois, se necessário.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={del}>Inativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
