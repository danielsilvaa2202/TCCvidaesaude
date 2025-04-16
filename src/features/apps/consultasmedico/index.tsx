"use client";

import React, { useEffect, useState } from "react";
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
// Interfaces
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

//
// Constants
//
const STATUS_AGENDADA = 1;
const STATUS_CONCLUIDA = 2;

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

export default function ConsultaMedicoPage() {
  const [selectedMedicoId, setSelectedMedicoId] = useState<number>(1);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [consultations, setConsultations] = useState<ProcessedConsultation[]>([]);
  const [selected, setSelected] = useState<ProcessedConsultation | null>(null);

  // histórico
  const [obs, setObs] = useState<string>("");
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [novaAlergia, setNovaAlergia] = useState<string>("");
  const [novaPrescricao, setNovaPrescricao] = useState<string>("");
  const [medicos, setMedicos] = useState<{ id_medico: number; prof_nome: string }[]>([]);

  // carrega médicos
  useEffect(() => {
    fetch("/api/medicos")
      .then(r => r.json())
      .then(data => setMedicos(data))
      .catch(console.error);
  }, []);

  // carrega consultas
  useEffect(() => {
    fetch("/api/consultas")
      .then(r => r.json() as Promise<Consultation[]>)
      .then(data => {
        const m = data.map(c => ({
          id_consulta: c.id_consulta,
          id_medico: c.id_medico,
          id_paciente: c.id_paciente,
          consult_data: c.consult_data,
          consult_hora: c.consult_hora,
          patientName: c.pac_nome,
          specialty: c.tipoconsulta_nome,
          id_consult_status: c.id_consult_status,
        }));
        setConsultations(m);
      })
      .catch(console.error);
  }, []);

  // filtra agenda
  const filtered = consultations.filter(c => {
    if (c.id_medico !== selectedMedicoId) return false;
    if (dateFrom && c.consult_data < dateFrom) return false;
    if (dateTo && c.consult_data > dateTo) return false;
    return true;
  });

  // carrega histórico completo
  function loadHistorico(id: number) {
    fetch(`/api/historico-medico/paciente/${id}`)
      .then(r => r.json())
      .then(data => {
        setHistorico(data.historicos || []);
        setAlergias(data.alergias || []);
        setPrescricoes(data.prescricoes || []);
      })
      .catch(console.error);
  }

  // seleciona consulta
  function handleSelect(c: ProcessedConsultation) {
    if (c.id_consult_status !== STATUS_AGENDADA) return;
    setSelected(c);
    setObs("");
    setHistorico([]);
    setAlergias([]);
    setPrescricoes([]);
    loadHistorico(c.id_paciente);
  }

  // cancelar seleção
  function handleCancel() {
    setSelected(null);
    setObs("");
    setHistorico([]);
    setAlergias([]);
    setPrescricoes([]);
  }

  // salvar observação
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
      .then(r => { if (!r.ok) throw new Error(); })
      .then(() => {
        setObs("");
        loadHistorico(selected.id_paciente);
      })
      .catch(() => alert("Erro ao salvar histórico"));
  }

  // adicionar alergia
  function addAlergia() {
    if (!selected || !historico.length) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/alergias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_alergia: Number(novaAlergia) }),
    })
      .then(r => { if (!r.ok) throw new Error(); })
      .then(() => {
        setNovaAlergia("");
        loadHistorico(selected.id_paciente);
      })
      .catch(() => alert("Erro ao adicionar alergia"));
  }

  // adicionar prescrição
  function addPrescricao() {
    if (!selected || !historico.length) return;
    const hid = historico[0].id_histmed;
    fetch(`/api/historico-medico/${hid}/prescricoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hist_prescricao: novaPrescricao }),
    })
      .then(r => { if (!r.ok) throw new Error(); })
      .then(() => {
        setNovaPrescricao("");
        loadHistorico(selected.id_paciente);
      })
      .catch(() => alert("Erro ao adicionar prescrição"));
  }

  // concluir consulta
  function conclude() {
    if (!selected) return;
    const id = selected.id_consulta;
    fetch(`/api/consultas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_consult_status: STATUS_CONCLUIDA }),
    })
      .then(r => { if (!r.ok) throw new Error("Não foi possível concluir"); })
      .then(() =>
        fetch("/api/feedbackconsulta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_consulta: id,
            feedback_nota: null,
            feedback_observacoes: null,
            feedback_data: new Date().toISOString().split("T")[0],
          }),
        })
      )
      .then(r => { if (!r.ok) throw new Error("Erro ao solicitar feedback"); })
      .then(() => {
        alert("Consulta concluída e e‑mail de feedback enviado.");
        handleCancel();
        // recarrega agenda
        return fetch("/api/consultas")
          .then(r => r.json() as Promise<Consultation[]>)
          .then(data => {
            const m = data.map(c => ({
              id_consulta: c.id_consulta,
              id_medico: c.id_medico,
              id_paciente: c.id_paciente,
              consult_data: c.consult_data,
              consult_hora: c.consult_hora,
              patientName: c.pac_nome,
              specialty: c.tipoconsulta_nome,
              id_consult_status: c.id_consult_status,
            }));
            setConsultations(m);
          });
      })
      .catch(err => alert(err.message));
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
        <h1 className="text-3xl font-bold">Acesso do Médico</h1>

        <Tabs defaultValue="agenda" className="space-y-4">
  <div className="flex items-center justify-between">
    <TabsList>
      <TabsTrigger value="agenda">Agenda</TabsTrigger>
      <TabsTrigger value="dados" disabled={!selected}>Dados</TabsTrigger>
      <TabsTrigger value="alergias" disabled={!selected}>Alergias</TabsTrigger>
      <TabsTrigger value="prescricoes" disabled={!selected}>Prescrições</TabsTrigger>
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

          {/* AGENDA */}
          <TabsContent value="agenda">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Agenda do Médico</CardTitle>
                <CardDescription>Selecione médico e intervalo de datas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Label>Médico:</Label>
                  <select
                    value={selectedMedicoId}
                    onChange={e => setSelectedMedicoId(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    {medicos.map(m => (
                      <option key={m.id_medico} value={m.id_medico}>
                        {m.prof_nome}
                      </option>
                    ))}
                  </select>
                  <Label>De:</Label>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  <Label>Até:</Label>
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
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
                      {filtered.map(c => (
                        <TableRow key={c.id_consulta}>
                          <TableCell>{new Date(c.consult_data).toLocaleDateString("pt-BR")}</TableCell>
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

          {/* DADOS */}
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
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map(h => (
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
                <div className="space-y-2">
                  <Label>Nova Observação</Label>
                  <Textarea
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    placeholder="Descrever..."
                  />
                  <Button onClick={saveObs}>Salvar Observação</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALERGIAS */}
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
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="ID da alergia"
                    value={novaAlergia}
                    onChange={e => setNovaAlergia(e.target.value)}
                  />
                  <Button onClick={addAlergia}>Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRESCRIÇÕES */}
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
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nova prescrição"
                    value={novaPrescricao}
                    onChange={e => setNovaPrescricao(e.target.value)}
                  />
                  <Button onClick={addPrescricao}>Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
