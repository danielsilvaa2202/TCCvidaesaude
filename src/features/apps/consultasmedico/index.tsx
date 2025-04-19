// frontend/src/app/consultasmedico/index.tsx

"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

//
// ─── INTERFACES ────────────────────────────────────────────────────────────────
//
interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

interface Consultation {
  id_consulta: number;
  id_medico: number;
  id_paciente: number;
  consult_data: string;
  consult_hora: string;
  pac_nome: string;
  tipoconsulta_nome: string;
  id_consult_status: number;
}

interface ProcessedConsultation {
  id_consulta: number;
  id_medico: number;
  id_paciente: number;
  consult_data: string;
  consult_hora: string;
  patientName: string;
  specialty: string;
  id_consult_status: number;
}

interface Historico {
  id_histmed: number;
  hist_descricao: string;
  hist_data_ultima_alteracao: string;
}

interface Alergia {
  id_histmed: number;
  alergia_nome: string;
}

interface Prescricao {
  id_histmed: number;
  hist_prescricao: string;
}

interface MedHist {
  id_histmed: number;
  id_medicamento: number;
  medicamento_nome: string;
  duracao: string;
}

interface MedList {
  id_medicamento: number;
  medicamento_nome: string;
}

interface DurList {
  id_duracao_med: number;
  id_medicamento: number;
  duracao: string;
}

interface Doenca {
  id_histmed: number;
  doenca_nome: string;
}

interface DoencaFamiliar {
  id_histmed: number;
  doenca_familiar_nome: string;
}

//
// ─── CONSTANTES ────────────────────────────────────────────────────────────────
//
const STATUS_AGENDADA = 1;
const STATUS_CONCLUIDA = 2;

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

//
// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
//
export default function ConsultaGestaoPage() {
  // ── filtros gerais ─────────────────────────────────────────────────────────
  const [selectedMedicoId, setSelectedMedicoId] = useState<number>(1);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // ── consultas ───────────────────────────────────────────────────────────────
  const [consultations, setConsultations] = useState<ProcessedConsultation[]>([]);
  const [selected, setSelected] = useState<ProcessedConsultation | null>(null);

  // ── histórico ───────────────────────────────────────────────────────────────
  const [obs, setObs] = useState<string>("");
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [medicamentosHistorico, setMedicamentosHistorico] = useState<MedHist[]>([]);
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  const [doencasFamiliares, setDoencasFamiliares] = useState<DoencaFamiliar[]>([]);

  // ── listas dropdown ─────────────────────────────────────────────────────────
  const [medicamentosList, setMedicamentosList] = useState<MedList[]>([]);
  const [duracoesList, setDuracoesList] = useState<DurList[]>([]);

  // ── autocomplete alergias ───────────────────────────────────────────────────
  const [alergiasOpcoes, setAlergiasOpcoes] =
    useState<{ id_alergia: number; alergia_nome: string }[]>([]);
  const [alergiaSuggestions, setAlergiaSuggestions] = useState<typeof alergiasOpcoes>([]);
  const [novaAlergiaName, setNovaAlergiaName] = useState<string>("");
  const [novaAlergiaId, setNovaAlergiaId] = useState<number | "">("");

  // ── autocomplete doenças ────────────────────────────────────────────────────
  const [doencasOpcoes, setDoencasOpcoes] =
    useState<{ id_doenca: number; doenca_nome: string }[]>([]);
  const [doencaSuggestions, setDoencaSuggestions] = useState<typeof doencasOpcoes>([]);
  const [novaDoencaName, setNovaDoencaName] = useState<string>("");
  const [novaDoencaId, setNovaDoencaId] = useState<number | "">("");

  // ── autocomplete doenças familiares ─────────────────────────────────────────
  const [doencasFamOpcoes, setDoencasFamOpcoes] =
    useState<{ id_doenca_familiar: number; doenca_familiar_nome: string }[]>([]);
  const [doencaFamSuggestions, setDoencaFamSuggestions] =
    useState<typeof doencasFamOpcoes>([]);
  const [novaDoencaFamName, setNovaDoencaFamName] = useState<string>("");
  const [novaDoencaFamId, setNovaDoencaFamId] = useState<number | "">("");

  // ── prescrições & remédios (inputs de formulário) ───────────────────────────
  const [novaPrescricao, setNovaPrescricao] = useState<string>("");
  const [novaMedId, setNovaMedId] = useState<number | "">("");
  const [novaDurId, setNovaDurId] = useState<number | "">("");

  // ── médicos ────────────────────────────────────────────────────────────────
  const [medicos, setMedicos] = useState<{ id_medico: number; prof_nome: string }[]>([]);

  //
  // ─── CARREGAR LISTAS INICIAIS ───────────────────────────────────────────────
  //
  useEffect(() => {
    // médicos
    fetch("/api/medicos")
      .then((r) => r.json())
      .then(setMedicos)
      .catch(console.error);

    // consultas
    fetch("/api/consultas")
      .then((r) => r.json() as Promise<Consultation[]>)
      .then((data) => {
        const mapped = data.map((c) => ({
          id_consulta: c.id_consulta,
          id_medico: c.id_medico,
          id_paciente: c.id_paciente,
          consult_data: c.consult_data,
          consult_hora: c.consult_hora,
          patientName: c.pac_nome,
          specialty: c.tipoconsulta_nome,
          id_consult_status: c.id_consult_status,
        }));
        setConsultations(mapped);
      })
      .catch(console.error);

    // medicamentos / durações
    fetch("/api/medicamentos")
      .then((r) => r.json())
      .then(setMedicamentosList)
      .catch(console.error);

    fetch("/api/duracoes-medicamento")
      .then((r) => r.json())
      .then(setDuracoesList)
      .catch(console.error);

    // alergias / doenças / doenças familiares
    fetch("/api/alergias")
      .then((r) => r.json())
      .then(setAlergiasOpcoes)
      .catch(console.error);

    fetch("/api/doencas")
      .then((r) => r.json())
      .then(setDoencasOpcoes)
      .catch(console.error);

    fetch("/api/doencasfamiliares")
      .then((r) => r.json())
      .then(setDoencasFamOpcoes)
      .catch(console.error);
  }, []);

  //
  // ─── FILTRO DE AGENDAS (datas / médico) ─────────────────────────────────────
  //
  // ─── FILTRO DE AGENDAS (datas / médico) ───────────────────────────────────
const filtered = consultations.filter((c) => {
  if (c.id_medico !== selectedMedicoId) return false;

  const consultDate = parseIsoDate(c.consult_data);

  if (dateFrom && consultDate < parseIsoDate(dateFrom)) return false;

  if (dateTo) {
    const dtTo = parseIsoDate(dateTo);
    dtTo.setHours(23, 59, 59, 999);          // inclui todo o dia “Até”
    if (consultDate > dtTo) return false;
  }
  return true;
});


  //
  // ─── CARREGAR HISTÓRICO COMPLETO DO PACIENTE ────────────────────────────────
  //
  function loadHistorico(pacienteId: number) {
    fetch(`/api/historico-medico/paciente/${pacienteId}`)
      .then((r) => r.json())
      .then((data) => {
        setHistorico(data.historicos || []);
        setAlergias(data.alergias || []);
        setPrescricoes(data.prescricoes || []);
        setMedicamentosHistorico(data.medicamentos || []);
        setDoencas(data.doencas || []);
        setDoencasFamiliares(data.doencas_familiares || []);
      })
      .catch(() => alert("Erro ao carregar histórico"));
  }

  //
  // ─── SELECIONAR CONSULTA ────────────────────────────────────────────────────
  //
  function handleSelect(c: ProcessedConsultation) {
    if (c.id_consult_status !== STATUS_AGENDADA) return;
    setSelected(c);
    setObs("");
    setHistorico([]);
    setAlergias([]);
    setPrescricoes([]);
    setMedicamentosHistorico([]);
    setDoencas([]);
    setDoencasFamiliares([]);
    loadHistorico(c.id_paciente);
  }

  function handleCancel() {
    setSelected(null);
    setObs("");
    setHistorico([]);
    setAlergias([]);
    setPrescricoes([]);
    setMedicamentosHistorico([]);
    setDoencas([]);
    setDoencasFamiliares([]);
  }

  //
  // ─── SALVAR OBSERVAÇÃO ──────────────────────────────────────────────────────
  //
  function saveObs() {
    if (!selected) return;
    fetch("/api/historico-medico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_consulta: selected.id_consulta,
        id_paciente: selected.id_paciente,
        id_medico: selected.id_medico,
        hist_descricao: obs,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao salvar histórico");
        return r.json();
      })
      .then(() => loadHistorico(selected.id_paciente))
      .catch((err) => alert(err.message));
  }

  function parseIsoDate(iso: string): Date {
    return new Date(`${iso}T00:00:00`);
  }
  
  /** Converte "YYYY‑MM‑DD" → "DD/MM/YYYY" respeitando locale pt‑BR. */
  function formatPtBr(iso: string): string {
    return parseIsoDate(iso).toLocaleDateString("pt-BR");
  }

  //
  // ─── HANDLERS DE AUTOCOMPLETE ───────────────────────────────────────────────
  //
  function handleAlergiaChange(value: string) {
    setNovaAlergiaName(value);
    const list = alergiasOpcoes.filter((a) =>
      a.alergia_nome.toLowerCase().includes(value.toLowerCase()),
    );
    setAlergiaSuggestions(list.slice(0, 5));
    const exact = alergiasOpcoes.find(
      (a) => a.alergia_nome.toLowerCase() === value.toLowerCase(),
    );
    setNovaAlergiaId(exact ? exact.id_alergia : "");
  }

  function handleDoencaChange(value: string) {
    setNovaDoencaName(value);
    const list = doencasOpcoes.filter((d) =>
      d.doenca_nome.toLowerCase().includes(value.toLowerCase()),
    );
    setDoencaSuggestions(list.slice(0, 5));
    const exact = doencasOpcoes.find(
      (d) => d.doenca_nome.toLowerCase() === value.toLowerCase(),
    );
    setNovaDoencaId(exact ? exact.id_doenca : "");
  }

  function handleDoencaFamChange(value: string) {
    setNovaDoencaFamName(value);
    const list = doencasFamOpcoes.filter((d) =>
      d.doenca_familiar_nome.toLowerCase().includes(value.toLowerCase()),
    );
    setDoencaFamSuggestions(list.slice(0, 5));
    const exact = doencasFamOpcoes.find(
      (d) => d.doenca_familiar_nome.toLowerCase() === value.toLowerCase(),
    );
    setNovaDoencaFamId(exact ? exact.id_doenca_familiar : "");
  }

  //
  // ─── ADDERS (alergia / doença / doença familiar / prescrição / medicamento)
  //
  function addAlergia() {
    if (!selected || !historico.length || !novaAlergiaId) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/alergias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_alergia: novaAlergiaId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao adicionar alergia");
        return r.json();
      })
      .then(() => {
        setNovaAlergiaName("");
        setNovaAlergiaId("");
        setAlergiaSuggestions([]);
        loadHistorico(selected.id_paciente);
      })
      .catch((err) => alert(err.message));
  }

  function addDoenca() {
    if (!selected || !historico.length || !novaDoencaId) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/doencas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_doenca: novaDoencaId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao adicionar doença");
        return r.json();
      })
      .then(() => {
        setNovaDoencaName("");
        setNovaDoencaId("");
        setDoencaSuggestions([]);
        loadHistorico(selected.id_paciente);
      })
      .catch((err) => alert(err.message));
  }

  function addDoencaFamiliar() {
    if (!selected || !historico.length || !novaDoencaFamId) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/doencasfamiliares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_doenca_familiar: novaDoencaFamId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao adicionar doença familiar");
        return r.json();
      })
      .then(() => {
        setNovaDoencaFamName("");
        setNovaDoencaFamId("");
        setDoencaFamSuggestions([]);
        loadHistorico(selected.id_paciente);
      })
      .catch((err) => alert(err.message));
  }

  function addPrescricao() {
    if (!selected || !historico.length || !novaPrescricao.trim()) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/prescricoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hist_prescricao: novaPrescricao }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao adicionar prescrição");
        return r.json();
      })
      .then(() => {
        setNovaPrescricao("");
        loadHistorico(selected.id_paciente);
      })
      .catch((err) => alert(err.message));
  }

  function addMedicamento() {
    if (!selected || !historico.length) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/medicamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_medicamento: Number(novaMedId),
        id_duracao_med: Number(novaDurId),
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao adicionar medicamento");
        return r.json();
      })
      .then(() => {
        setNovaMedId("");
        setNovaDurId("");
        loadHistorico(selected.id_paciente);
      })
      .catch((err) => alert(err.message));
  }

  //
  // ─── CONCLUIR CONSULTA ──────────────────────────────────────────────────────
  //
  function conclude() {
    if (!selected) return;
    const id = selected.id_consulta;
    fetch(`/api/consultas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_consult_status: STATUS_CONCLUIDA }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Não foi possível concluir");
        return r.json();
      })
      .then(() => {
        alert("Consulta concluída e e‑mail de feedback enviado.");
        handleCancel();
        return fetch("/api/consultas")
          .then((r) => r.json() as Promise<Consultation[]>)
          .then((data) => {
            const mapped = data.map((c) => ({
              id_consulta: c.id_consulta,
              id_medico: c.id_medico,
              id_paciente: c.id_paciente,
              consult_data: c.consult_data,
              consult_hora: c.consult_hora,
              patientName: c.pac_nome,
              specialty: c.tipoconsulta_nome,
              id_consult_status: c.id_consult_status,
            }));
            setConsultations(mapped);
          });
      })
      .catch((err) => alert(err.message));
  }

  //
  // ─── RENDER ─────────────────────────────────────────────────────────────────
  //
  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Gestão de Consultas</h1>

        <Tabs defaultValue="agenda" className="space-y-4">
          {/* ── cabeçalho dos tabs + botões ───────────────────────── */}
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="dados" disabled={!selected}>Dados</TabsTrigger>
              <TabsTrigger value="alergias" disabled={!selected}>Alergias</TabsTrigger>
              <TabsTrigger value="doencas" disabled={!selected}>Doenças</TabsTrigger>
              <TabsTrigger value="doencasfamiliares" disabled={!selected}>
                Doenças Familiares
              </TabsTrigger>
              <TabsTrigger value="prescricoes" disabled={!selected}>Prescrições</TabsTrigger>
              <TabsTrigger value="medicamentos" disabled={!selected}>Medicamentos</TabsTrigger>
            </TabsList>

            {selected && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={conclude}>Concluir</Button>
              </div>
            )}
          </div>

          {/**********************************************************************
           * 1. AGENDA
           *********************************************************************/}
          <TabsContent value="agenda">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Agenda do Médico</CardTitle>
                <CardDescription>Selecione médico e intervalo de datas.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* filtros de agenda */}
                <div className="flex items-center gap-2 mb-4">
                  <Label>Médico:</Label>
                  <select
                    value={selectedMedicoId}
                    onChange={(e) => setSelectedMedicoId(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    {medicos.map((m) => (
                      <option key={m.id_medico} value={m.id_medico}>
                        {m.prof_nome}
                      </option>
                    ))}
                  </select>
                  <Label>De:</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  <Label>Até:</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>

                {/* tabela agenda */}
                <ScrollArea className="h-[300px]">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => (
                        <TableRow key={c.id_consulta}>
                          <TableCell>{formatPtBr(c.consult_data)}</TableCell>
                          <TableCell>{c.consult_hora}</TableCell>
                          <TableCell>{c.patientName}</TableCell>
                          <TableCell>{c.specialty}</TableCell>
                          <TableCell>
                            {c.id_consult_status === STATUS_AGENDADA ? "Agendada" : "Concluída"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={c.id_consult_status !== STATUS_AGENDADA || !!selected}
                              onClick={() => handleSelect(c)}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            Nenhuma consulta
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/**********************************************************************
           * 2. DADOS
           *********************************************************************/}
          <TabsContent value="dados">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Dados da Consulta</CardTitle>
                <CardDescription>
                  {selected
                    ? `#${selected.id_consulta} – ${selected.patientName}`
                    : "Selecione na agenda"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* histórico de observações */}
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map((h) => (
                        <TableRow key={h.id_histmed}>
                          <TableCell>
                            {new Date(h.hist_data_ultima_alteracao).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>{h.hist_descricao}</TableCell>
                        </TableRow>
                      ))}
                      {historico.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Sem histórico
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* nova observação */}
                <div className="space-y-2">
                  <Label>Nova Observação</Label>
                  <Textarea
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Descrever..."
                  />
                  <Button onClick={saveObs}>Salvar Observação</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/**********************************************************************
           * 3. ALERGIAS
           *********************************************************************/}
          <TabsContent value="alergias">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Alergias</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alergia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alergias.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell>{a.alergia_nome}</TableCell>
                        </TableRow>
                      ))}
                      {alergias.length === 0 && (
                        <TableRow>
                          <TableCell className="text-center">Sem alergias</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* adicionar alergia */}
                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Digite alergia..."
                    value={novaAlergiaName}
                    onChange={(e) => handleAlergiaChange(e.target.value)}
                  />
                  {alergiaSuggestions.length > 0 && novaAlergiaName && (
                    <ul className="absolute bg-white border rounded mt-1 z-10 w-full max-h-40 overflow-y-auto">
                      {alergiaSuggestions.map((a) => (
                        <li
                          key={a.id_alergia}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNovaAlergiaName(a.alergia_nome);
                            setNovaAlergiaId(a.id_alergia);
                            setAlergiaSuggestions([]);
                          }}
                        >
                          {a.alergia_nome}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button className="mt-2" onClick={addAlergia} disabled={!novaAlergiaId}>
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/**********************************************************************
           * 4. DOENÇAS
           *********************************************************************/}
          <TabsContent value="doencas">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Doenças</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doença</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doencas.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.doenca_nome}</TableCell>
                        </TableRow>
                      ))}
                      {doencas.length === 0 && (
                        <TableRow>
                          <TableCell className="text-center">Sem doenças registradas</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* adicionar doença */}
                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Digite doença..."
                    value={novaDoencaName}
                    onChange={(e) => handleDoencaChange(e.target.value)}
                  />
                  {doencaSuggestions.length > 0 && novaDoencaName && (
                    <ul className="absolute bg-white border rounded mt-1 z-10 w-full max-h-40 overflow-y-auto">
                      {doencaSuggestions.map((d) => (
                        <li
                          key={d.id_doenca}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNovaDoencaName(d.doenca_nome);
                            setNovaDoencaId(d.id_doenca);
                            setDoencaSuggestions([]);
                          }}
                        >
                          {d.doenca_nome}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button className="mt-2" onClick={addDoenca} disabled={!novaDoencaId}>
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/**********************************************************************
           * 5. DOENÇAS FAMILIARES
           *********************************************************************/}
          <TabsContent value="doencasfamiliares">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Doenças Familiares</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doença Familiar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doencasFamiliares.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.doenca_familiar_nome}</TableCell>
                        </TableRow>
                      ))}
                      {doencasFamiliares.length === 0 && (
                        <TableRow>
                          <TableCell className="text-center">Sem registros</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* adicionar doença familiar */}
                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Digite doença familiar..."
                    value={novaDoencaFamName}
                    onChange={(e) => handleDoencaFamChange(e.target.value)}
                  />
                  {doencaFamSuggestions.length > 0 && novaDoencaFamName && (
                    <ul className="absolute bg-white border rounded mt-1 z-10 w-full max-h-40 overflow-y-auto">
                      {doencaFamSuggestions.map((d) => (
                        <li
                          key={d.id_doenca_familiar}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNovaDoencaFamName(d.doenca_familiar_nome);
                            setNovaDoencaFamId(d.id_doenca_familiar);
                            setDoencaFamSuggestions([]);
                          }}
                        >
                          {d.doenca_familiar_nome}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  className="mt-2"
                  onClick={addDoencaFamiliar}
                  disabled={!novaDoencaFamId}
                >
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/**********************************************************************
           * 6. PRESCRIÇÕES
           *********************************************************************/}
          <TabsContent value="prescricoes">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Prescrições</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prescrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescricoes.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.hist_prescricao}</TableCell>
                        </TableRow>
                      ))}
                      {prescricoes.length === 0 && (
                        <TableRow>
                          <TableCell className="text-center">Sem prescrições</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* adicionar prescrição */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nova prescrição"
                    value={novaPrescricao}
                    onChange={(e) => setNovaPrescricao(e.target.value)}
                  />
                  <Button onClick={addPrescricao}>Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/**********************************************************************
           * 7. MEDICAMENTOS
           *********************************************************************/}
          <TabsContent value="medicamentos">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Medicamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Duração</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicamentosHistorico.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell>{m.medicamento_nome}</TableCell>
                          <TableCell>{m.duracao}</TableCell>
                        </TableRow>
                      ))}
                      {medicamentosHistorico.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Sem medicamentos
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* adicionar medicamento */}
                <div className="flex gap-2">
                  <select
                    value={novaMedId}
                    onChange={(e) => setNovaMedId(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Selecione medicamento…</option>
                    {medicamentosList.map((m) => (
                      <option key={m.id_medicamento} value={m.id_medicamento}>
                        {m.medicamento_nome}
                      </option>
                    ))}
                  </select>

                  <select
                    value={novaDurId}
                    onChange={(e) => setNovaDurId(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                    disabled={!novaMedId}
                  >
                    <option value="">Selecione duração…</option>
                    {duracoesList
                      .filter((d) => d.id_medicamento === Number(novaMedId))
                      .map((d) => (
                        <option key={d.id_duracao_med} value={d.id_duracao_med}>
                          {d.duracao}
                        </option>
                      ))}
                  </select>

                  <Button onClick={addMedicamento} disabled={!novaMedId || !novaDurId}>
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
