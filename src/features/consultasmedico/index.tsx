"use client";

import React, { useState } from "react";

// -------------
// Layout & UI
// -------------
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Se existir no seu projeto
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// -------------
// Tipos
// -------------
interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

// Simples modelagem da agenda
interface Consultation {
  id: number;
  idMedico: number; // Relacionado ao Medicos.id_medico
  idPaciente: number; // Pacientes
  date: string;  // YYYY-MM-DD
  time: string;  // HH:mm
  doctorName: string;  
  patientName: string;
  specialty: string;
  // etc. (id_consulta no BD, status, etc.)
}

interface Medico {
  idMedico: number;
  nome: string;
  crm: string;
  especialidade: string;
}

// -------------
// Dados Mock
// -------------
const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];


// Lista de médicos fictícios
const mockMedicos: Medico[] = [
  { idMedico: 1, nome: "Dr. Daniel Silva", crm: "12345", especialidade: "Cardiologia" },
  { idMedico: 2, nome: "Dra. Maria Souza", crm: "67890", especialidade: "Pediatria" },
];

// Agenda fictícia de consultas
const mockConsultations: Consultation[] = [
  {
    id: 101,
    idMedico: 1,
    idPaciente: 501,
    date: "2025-09-20",
    time: "10:00",
    doctorName: "Dr. Daniel Silva",
    patientName: "Renata Boppre",
    specialty: "Cardiologia",
  },
  {
    id: 102,
    idMedico: 1,
    idPaciente: 502,
    date: "2025-09-20",
    time: "14:30",
    doctorName: "Dr. Daniel Silva",
    patientName: "João Silva",
    specialty: "Cardiologia",
  },
  {
    id: 201,
    idMedico: 2,
    idPaciente: 503,
    date: "2025-09-21",
    time: "09:15",
    doctorName: "Dra. Maria Souza",
    patientName: "Paulo Costa",
    specialty: "Pediatria",
  },
];

const ConsultaMedicoPage: React.FC = () => {
  // -----------------------------------
  // Estado: Filtros / Seleção do médico
  // -----------------------------------
  const [selectedMedicoId, setSelectedMedicoId] = useState<number>(1); // default 1
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // -----------------------------------
  // Estado: Lista de consultas (mock)
  // -----------------------------------
  const [consultations] = useState<Consultation[]>(mockConsultations);

  // -----------------------------------
  // Estado: qual consulta está selecionada
  // -----------------------------------
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // -----------------------------------
  // Estado: campo "observações" (exemplo)
  // -----------------------------------
  const [observacoes, setObservacoes] = useState("");

  // -----------------------------------
  // Filtrar a lista de consultas pela "Agenda"
  // -----------------------------------
  const filteredConsultations = consultations.filter((c) => {
    const sameMedico = c.idMedico === selectedMedicoId;
    const inRange =
      (!dateFrom || c.date >= dateFrom) &&
      (!dateTo || c.date <= dateTo);
    return sameMedico && inRange;
  });

  // -----------------------------------
  // Handler: selecionar uma consulta
  // -----------------------------------
  const handleSelectConsulta = (consulta: Consultation) => {
    setSelectedConsultation(consulta);
    // Exemplo: busque do BD `HistoricoMedico` para populá-lo
    // Por enquanto, "observacoes" reset ou carrega algo fictício:
    setObservacoes("");
  };

  // -----------------------------------
  // Handler: salvar as mudanças na consulta
  // -----------------------------------
  const handleSalvarConsulta = () => {
    if (!selectedConsultation) return;
    alert(
      `Salvando dados da consulta ID: ${selectedConsultation.id}\n` +
      `Observações: ${observacoes}`
    );
    // AQUI -> Chamar API p/ atualizar HistoricoMedico / consult_observacoes etc.
  };

  // -----------------------------------
  // Render
  // -----------------------------------
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
          Acesso do Médico
        </h1>

        {/* Abas no topo */}
        <Tabs
          // desabilite abas adicionais se não tiver selectedConsultation
          defaultValue="agenda"
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger
              value="dados"
              disabled={!selectedConsultation}
            >
              Dados da Consulta
            </TabsTrigger>
            <TabsTrigger
              value="alergias"
              disabled={!selectedConsultation}
            >
              Alergias
            </TabsTrigger>
            <TabsTrigger
              value="medicamentos"
              disabled={!selectedConsultation}
            >
              Medicamentos
            </TabsTrigger>
            <TabsTrigger
              value="doencas"
              disabled={!selectedConsultation}
            >
              Doenças
            </TabsTrigger>
            <TabsTrigger
              value="familiares"
              disabled={!selectedConsultation}
            >
              Doenças Familiares
            </TabsTrigger>
            <TabsTrigger
              value="prescricoes"
              disabled={!selectedConsultation}
            >
              Prescrições
            </TabsTrigger>
          </TabsList>

          {/* -----------------------
              TAB 1: AGENDA DO MÉDICO
             ----------------------- */}
          <TabsContent value="agenda">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold font-quicksand">
                  Agenda do Médico
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Selecione o médico e o intervalo de datas para ver as consultas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros da Agenda */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Label>Médico:</Label>
                  <select
                    value={selectedMedicoId}
                    onChange={(e) => setSelectedMedicoId(Number(e.target.value))}
                    className="px-3 py-2 border rounded-md shadow-sm focus:outline-none"
                  >
                    {mockMedicos.map((m) => (
                      <option key={m.idMedico} value={m.idMedico}>
                        {m.nome} ({m.crm})
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

                {/* Tabela de Consultas (Agenda) */}
                <ScrollArea className="h-[300px]">
                  <Table className="w-full table-auto border-separate border-spacing-0 text-sm">
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                          Data
                        </TableHead>
                        <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                          Hora
                        </TableHead>
                        <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                          Paciente
                        </TableHead>
                        <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                          Especialidade
                        </TableHead>
                        <TableHead className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsultations.map((cons) => (
                        <TableRow
                          key={cons.id}
                          className="border-b last:border-0 even:bg-muted/25 hover:bg-muted/50"
                        >
                          <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                            {new Date(cons.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="px-2 py-2 align-middle">
                            {cons.time}
                          </TableCell>
                          <TableCell className="px-2 py-2 align-middle">
                            {cons.patientName}
                          </TableCell>
                          <TableCell className="px-2 py-2 align-middle">
                            {cons.specialty}
                          </TableCell>
                          <TableCell className="px-2 py-2 align-middle">
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
          </TabsContent>

          {/* -----------------------
              TAB 2: DADOS DA CONSULTA
             ----------------------- */}
          <TabsContent value="dados">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold font-quicksand">
                  Dados da Consulta
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {selectedConsultation
                    ? `Consulta #${selectedConsultation.id} - Paciente: ${selectedConsultation.patientName}`
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
                        placeholder="Descreva achados clínicos, etc."
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

          {/* -----------------------
              TAB 3: ALERGIAS
             ----------------------- */}
          <TabsContent value="alergias">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Alergias</CardTitle>
                <CardDescription>Histórico de alergias do paciente.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <p>
                      <strong>Consulta: </strong>#{selectedConsultation.id}
                    </p>
                    {/* Exibir Tabela de Alergias ou Botão "Adicionar Alergia" */}
                    <p className="mt-2 text-sm">
                      Aqui você adicionaria/registra as alergias relacionadas ao
                      histórico médico...
                    </p>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba Agenda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -----------------------
              TAB 4: MEDICAMENTOS
             ----------------------- */}
          <TabsContent value="medicamentos">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Medicamentos</CardTitle>
                <CardDescription>Medicamentos prescritos ou em uso.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <p>
                      <strong>Consulta: </strong>#{selectedConsultation.id}
                    </p>
                    <p className="mt-2 text-sm">
                      Listagem ou form para adicionar medicamentos, duração etc.
                    </p>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba Agenda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -----------------------
              TAB 5: DOENÇAS
             ----------------------- */}
          <TabsContent value="doencas">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Doenças</CardTitle>
                <CardDescription>Histórico de doenças do paciente.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <p>
                      <strong>Consulta: </strong>#{selectedConsultation.id}
                    </p>
                    <p className="mt-2 text-sm">
                      Exemplo: tabela de doenças cadastradas, adicionar doença...
                    </p>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba Agenda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -----------------------
              TAB 6: DOENÇAS FAMILIARES
             ----------------------- */}
          <TabsContent value="familiares">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Doenças Familiares</CardTitle>
                <CardDescription>Histórico familiar.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <p>
                      <strong>Consulta: </strong>#{selectedConsultation.id}
                    </p>
                    <p className="mt-2 text-sm">
                      Exemplo: adicionar doenças familiares no histórico...
                    </p>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba Agenda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -----------------------
              TAB 7: PRESCRICOES
             ----------------------- */}
          <TabsContent value="prescricoes">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Prescrições</CardTitle>
                <CardDescription>Receitas ou recomendações médicas.</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConsultation ? (
                  <>
                    <p>
                      <strong>Consulta: </strong>#{selectedConsultation.id}
                    </p>
                    <p className="mt-2 text-sm">
                      Aqui você poderia registrar prescrições médicas
                      (HistoricoMedico_Prescricoes).
                    </p>
                  </>
                ) : (
                  <p>Selecione uma consulta na aba Agenda.</p>
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
