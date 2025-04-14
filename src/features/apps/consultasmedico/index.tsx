"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Navegação superior
interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

// Cada consulta retornada do backend
interface Consultation {
  id_consulta: number;
  id_profissional: number; 
  id_paciente: number;
  consult_data: string;
  consult_hora: string;
  patientName: string; 
  specialty: string;  
}

// Estrutura básica do histórico (tabela HistoricoMedico)
interface HistoricoMedico {
  id_histmed: number;
  id_consulta: number;
  id_paciente: number;
  id_medico: number;
  hist_descricao: string;
  hist_data_ultima_alteracao: string;
}

// Estrutura das alergias retornadas
interface AlergiaItem {
  id_histmed: number;
  id_alergia: number;
  alergia_nome: string;
}

// Estrutura das prescrições retornadas
interface PrescricaoItem {
  id_histmed: number;
  hist_prescricao: string;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

const ConsultaMedicoPage: React.FC = () => {
  // Supondo que este ID do médico venha de algum lugar (login, token, etc.)
  // Aqui deixaremos fixo.
  const [selectedMedicoId, setSelectedMedicoId] = useState<number>(1);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Lista de consultas carregadas do backend
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  // Consulta atual selecionada
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // Observações do médico que serão salvas no POST /api/historico-medico
  const [observacoes, setObservacoes] = useState("");

  // Dados retornados pelo endpoint /api/historico-medico/paciente/<id_paciente>
  const [historico, setHistorico] = useState<HistoricoMedico[]>([]);
  const [alergias, setAlergias] = useState<AlergiaItem[]>([]);
  const [prescricoes, setPrescricoes] = useState<PrescricaoItem[]>([]);

  // Campos para adicionar Alergia e Prescricao
  const [novaAlergia, setNovaAlergia] = useState("");
  const [novaPrescricao, setNovaPrescricao] = useState("");

  // Lista de médicos para o select
  const [allMedicos, setAllMedicos] = useState<{ id_medico: number; prof_nome: string }[]>([]);

  // Carrega lista de médicos
  useEffect(() => {
    fetch("/api/medicos")
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped = data.map((d) => ({
          id_medico: d.id_medico,
          prof_nome: d.prof_nome,
        }));
        setAllMedicos(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  // Carrega todas as consultas (o backend retorna as do sistema todo)
  // Depois filtramos localmente pelo ID do médico
  useEffect(() => {
    fetch("/api/consultas")
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped: Consultation[] = data.map((c: any) => ({
          id_consulta: c.id_consulta,
          id_profissional: c.id_medico, // <-- ESTE é o ID real do médico
          id_paciente: c.id_paciente,
          consult_data: c.consult_data,
          consult_hora: c.consult_hora,
          patientName: c.pac_nome || "Paciente",
          specialty: c.espec_nome || "Especialidade",
        }));
        setConsultations(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  // Filtro local das consultas do médico
  const filteredConsultations = consultations.filter((c) => {
    if (c.id_profissional !== selectedMedicoId) return false;
    if (dateFrom && c.consult_data < dateFrom) return false;
    if (dateTo && c.consult_data > dateTo) return false;
    return true;
  });

  // Ao selecionar uma consulta (clicar no botão "Selecionar")
  function handleSelectConsulta(cons: Consultation) {
    setSelectedConsultation(cons);
    setObservacoes(""); // limpar as observações
    setHistorico([]);
    setAlergias([]);
    setPrescricoes([]);
    if (!cons.id_paciente) return;
    // Chama o endpoint para carregar o histórico do paciente
    fetch(`/api/historico-medico/paciente/${cons.id_paciente}`)
      .then((r) => r.json())
      .then((data) => {
        // Ajuste as chaves conforme a resposta do seu backend
        setHistorico(data.historicos || []);
        setAlergias(data.alergias || []);
        setPrescricoes(data.prescricoes || []);
      })
      .catch((err) => console.error(err));
  }

  // Quando clicar em "Salvar Consulta" (na aba "Dados da Consulta")
  // Cria um novo histórico com base na consulta selecionada
  function handleSalvarConsulta() {
    if (!selectedConsultation) return;
    fetch("/api/historico-medico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_consulta: selectedConsultation.id_consulta,
        id_paciente: selectedConsultation.id_paciente,
        id_medico: selectedConsultation.id_profissional,
        hist_descricao: observacoes,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao salvar histórico");
        return res.json();
      })
      .then((data) => {
        alert("Histórico salvo com id_histmed = " + data.id_histmed);
        // Recarrega os dados do histórico para atualizar as informações da consulta selecionada
        handleSelectConsulta(selectedConsultation);
      })
      .catch((err) => {
        console.error(err);
        alert("Não foi possível salvar");
      });
  }

  // Adicionar alergia ao histórico (para o primeiro histórico existente)
  function handleAdicionarAlergia() {
    if (!selectedConsultation) return;
    if (!historico.length) {
      alert("Não há histórico criado ainda. Salve ao menos uma vez antes de adicionar alergias.");
      return;
    }
    const id_histmed = historico[0].id_histmed;
    fetch(`/api/historico-medico/${id_histmed}/alergias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_alergia: Number(novaAlergia) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao adicionar alergia");
        return res.json();
      })
      .then(() => {
        setAlergias((prev) => [
          ...prev,
          {
            id_histmed,
            id_alergia: Number(novaAlergia),
            alergia_nome: `Alergia #${novaAlergia}`,
          },
        ]);
        setNovaAlergia("");
      })
      .catch((err) => {
        console.error(err);
        alert("Não foi possível adicionar alergia");
      });
  }

  // Adicionar uma prescrição
  function handleAdicionarPrescricao() {
    if (!selectedConsultation) return;
    if (!historico.length) {
      alert("Não há histórico criado ainda. Salve o histórico antes de adicionar prescrição.");
      return;
    }
    const id_histmed = historico[0].id_histmed;
    fetch(`/api/historico-medico/${id_histmed}/prescricoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hist_prescricao: novaPrescricao }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao adicionar prescrição");
        return res.json();
      })
      .then(() => {
        setPrescricoes((prev) => [
          ...prev,
          {
            id_histmed,
            hist_prescricao: novaPrescricao,
          },
        ]);
        setNovaPrescricao("");
      })
      .catch((err) => {
        console.error(err);
        alert("Não foi possível adicionar prescrição");
      });
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
        <h1 className="text-3xl font-bold font-quicksand">Acesso do Médico</h1>

        <Tabs defaultValue="agenda" className="space-y-4">
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="dados" disabled={!selectedConsultation}>
              Dados da Consulta
            </TabsTrigger>
            <TabsTrigger value="alergias" disabled={!selectedConsultation}>
              Alergias
            </TabsTrigger>
            <TabsTrigger value="prescricoes" disabled={!selectedConsultation}>
              Prescrições
            </TabsTrigger>
          </TabsList>

          {/* Aba Agenda */}
          <TabsContent value="agenda">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold font-quicksand">
                  Agenda do Médico
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Selecione o médico e intervalo de datas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Label>Médico:</Label>
                  <select
                    value={selectedMedicoId}
                    onChange={(e) => setSelectedMedicoId(Number(e.target.value))}
                    className="px-3 py-2 border rounded-md shadow-sm focus:outline-none"
                  >
                    {allMedicos.map((m) => (
                      <option key={m.id_medico} value={m.id_medico}>
                        {m.prof_nome}
                      </option>
                    ))}
                  </select>

                  <Label>De:</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-auto"
                  />

                  <Label>Até:</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-auto"
                  />
                </div>

                <ScrollArea className="h-[300px]">
                  <Table className="w-full table-auto border-separate border-spacing-0 text-sm">
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="px-2 py-2">Data</TableHead>
                        <TableHead className="px-2 py-2">Hora</TableHead>
                        <TableHead className="px-2 py-2">Paciente</TableHead>
                        <TableHead className="px-2 py-2">Especialidade</TableHead>
                        <TableHead className="px-2 py-2">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsultations.map((cons) => (
                        <TableRow
                          key={cons.id_consulta}
                          className="border-b last:border-0 even:bg-muted/25 hover:bg-muted/50"
                        >
                          <TableCell className="px-2 py-2">
                            {new Date(cons.consult_data).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="px-2 py-2">{cons.consult_hora}</TableCell>
                          <TableCell className="px-2 py-2">{cons.patientName}</TableCell>
                          <TableCell className="px-2 py-2">{cons.specialty}</TableCell>
                          <TableCell className="px-2 py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectConsulta(cons)}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredConsultations.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="px-2 py-4 text-center text-muted-foreground"
                          >
                            Nenhuma consulta encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Dados da Consulta */}
          <TabsContent value="dados">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold font-quicksand">
                  Dados da Consulta
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {selectedConsultation
                    ? `Consulta #${selectedConsultation.id_consulta} - Paciente: ${selectedConsultation.patientName}`
                    : "Nenhuma consulta selecionada."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Observações do Médico</Label>
                      <Textarea
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Descreva achados clínicos..."
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleSalvarConsulta}>Salvar Consulta</Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecione uma consulta na aba "Agenda".
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Alergias */}
          <TabsContent value="alergias">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Alergias</CardTitle>
                <CardDescription>Histórico de alergias do paciente.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <ScrollArea className="h-[150px] mb-4">
                      <Table className="w-full table-auto">
                        <TableHeader>
                          <TableRow className="border-b">
                            <TableHead className="px-2 py-2">Alergia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alergias.map((a, i) => (
                            <TableRow key={i} className="border-b last:border-0">
                              <TableCell className="px-2 py-2">{a.alergia_nome}</TableCell>
                            </TableRow>
                          ))}
                          {alergias.length === 0 && (
                            <TableRow>
                              <TableCell className="px-2 py-2 text-center">
                                Nenhuma alergia registrada
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>

                    <div className="flex gap-2 items-center">
                      <Input
                        type="text"
                        placeholder="ID da alergia (ex: 1) ou algo"
                        value={novaAlergia}
                        onChange={(e) => setNovaAlergia(e.target.value)}
                      />
                      <Button onClick={handleAdicionarAlergia}>Adicionar</Button>
                    </div>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba "Agenda".</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Prescrições */}
          <TabsContent value="prescricoes">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Prescrições</CardTitle>
                <CardDescription>Receitas ou recomendações médicas.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <ScrollArea className="h-[150px] mb-4">
                      <Table className="w-full table-auto">
                        <TableHeader>
                          <TableRow className="border-b">
                            <TableHead className="px-2 py-2">Prescrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prescricoes.map((p, i) => (
                            <TableRow key={i} className="border-b last:border-0">
                              <TableCell className="px-2 py-2">{p.hist_prescricao}</TableCell>
                            </TableRow>
                          ))}
                          {prescricoes.length === 0 && (
                            <TableRow>
                              <TableCell className="px-2 py-2 text-center">
                                Nenhuma prescrição
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>

                    <div className="flex gap-2 items-center">
                      <Input
                        type="text"
                        placeholder="Digite a prescrição"
                        value={novaPrescricao}
                        onChange={(e) => setNovaPrescricao(e.target.value)}
                      />
                      <Button onClick={handleAdicionarPrescricao}>Adicionar</Button>
                    </div>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba "Agenda".</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default ConsultaMedicoPage;
