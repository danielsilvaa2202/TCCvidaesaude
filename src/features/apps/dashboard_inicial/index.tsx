"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

// Seu componente customizado de charts
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface IndicadoresGerais {
  totalConsultas: number;
  totalPacientes: number;
  totalMedicos: number;
  tempoMedioEspera: number;
  totalFeedbackRuim: number;
  mediaFeedback: number;
  lembretesPendentes: number;
}

interface ConsultasAgendadas {
  consult_data: string;
  total_consultas: number;
}

interface TempoEspera {
  consult_data: string;
  tempo_medio_espera: number;
}

interface ConsultasPorStatus {
  status_consulta: string;
  total: number;
}

interface ConsultasPorEspecialidade {
  espec_nome: string;
  total: number;
}

// Exemplo de links do TopNav
const topNavLinks = [
  { title: "Dashboard", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: false, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: false, disabled: false },
];

// Endpoints (exemplo)
const apiEndpoints = {
  indicadoresGerais: "/api/indicadores-gerais",
  consultasAgendadas: "/api/consultas-agendadas",
  tempoMedioEspera: "/api/tempo-medio-espera",
  consultasPorStatus: "/api/consultas-por-status",
  consultasPorEspecialidade: "/api/consultas-por-especialidade",
};

// Paleta de cores pastéis
const pastelColors = [
  "#FFB5A7", // rosa claro
  "#FCD5CE", // rosa-salmão
  "#F8EAD8", // bege claro
  "#BCEAD5", // verde-água claro
  "#A0C4FF", // azul claro
  "#BDB2FF", // roxinho claro
  "#FFC6FF", // lilás
];

// Config. personalizadas de cor (pastel) para alguns casos específicos
const chartConfigConsultas = {
  consultas: {
    label: "Consultas Agendadas",
    color: "#FFB5A7",
  },
};

const chartConfigTempoEspera = {
  tempo: {
    label: "Tempo Médio de Espera (min)",
    color: "#BCEAD5",
  },
};

// Config. para o Pie chart (Status)
const chartStatusColors: Record<string, string> = {
  Pendente: "#FFD59E",
  Confirmada: "#FFB5A7",
  Concluída: "#BCEAD5",
  Cancelada: "#FCD5CE",
};

// Config. para o Bar chart (Especialidades)
const chartEspecialidadeColors: Record<string, string> = {
  Cardiologia: "#FFB5A7",
  Pediatria: "#F8EAD8",
  Dermatologia: "#BCEAD5",
  Ortopedia: "#A0C4FF",
  Oftalmologia: "#BDB2FF",
};

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [indicadores, setIndicadores] = useState<IndicadoresGerais | null>(null);
  const [consultasAgendadas, setConsultasAgendadas] = useState<ConsultasAgendadas[]>([]);
  const [tempoEspera, setTempoEspera] = useState<TempoEspera[]>([]);
  const [consultasStatus, setConsultasStatus] = useState<ConsultasPorStatus[]>([]);
  const [consultasEspecialidade, setConsultasEspecialidade] = useState<ConsultasPorEspecialidade[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Dados de exemplo (mock). Substitua pelo fetch real
        const indicadoresMock: IndicadoresGerais = {
          totalConsultas: 1340,
          totalPacientes: 920,
          totalMedicos: 60,
          tempoMedioEspera: 11,
          totalFeedbackRuim: 8,
          mediaFeedback: 8.2,
          lembretesPendentes: 4,
        };

        const consultasAgendadasMock: ConsultasAgendadas[] = [
          { consult_data: "2025-10-01", total_consultas: 22 },
          { consult_data: "2025-10-02", total_consultas: 35 },
          { consult_data: "2025-10-03", total_consultas: 28 },
          { consult_data: "2025-10-04", total_consultas: 44 },
          { consult_data: "2025-10-05", total_consultas: 42 },
          { consult_data: "2025-10-06", total_consultas: 31 },
          { consult_data: "2025-10-07", total_consultas: 50 },
        ];

        const tempoEsperaMock: TempoEspera[] = [
          { consult_data: "2025-10-01", tempo_medio_espera: 10 },
          { consult_data: "2025-10-02", tempo_medio_espera: 12 },
          { consult_data: "2025-10-03", tempo_medio_espera: 9 },
          { consult_data: "2025-10-04", tempo_medio_espera: 14 },
          { consult_data: "2025-10-05", tempo_medio_espera: 16 },
          { consult_data: "2025-10-06", tempo_medio_espera: 11 },
          { consult_data: "2025-10-07", tempo_medio_espera: 8 },
        ];

        const consultasStatusMock: ConsultasPorStatus[] = [
          { status_consulta: "Pendente", total: 65 },
          { status_consulta: "Confirmada", total: 210 },
          { status_consulta: "Concluída", total: 950 },
          { status_consulta: "Cancelada", total: 115 },
        ];

        const consultasEspecialidadeMock: ConsultasPorEspecialidade[] = [
          { espec_nome: "Cardiologia", total: 300 },
          { espec_nome: "Pediatria", total: 180 },
          { espec_nome: "Dermatologia", total: 100 },
          { espec_nome: "Ortopedia", total: 200 },
          { espec_nome: "Oftalmologia", total: 110 },
        ];

        // Simulando um pequeno delay
        setTimeout(() => {
          setIndicadores(indicadoresMock);
          setConsultasAgendadas(consultasAgendadasMock);
          setTempoEspera(tempoEsperaMock);
          setConsultasStatus(consultasStatusMock);
          setConsultasEspecialidade(consultasEspecialidadeMock);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando dados...</p>
      </div>
    );
  }

  // Alertas de exemplo
  const showAlertaFeedbackRuim = indicadores && indicadores.totalFeedbackRuim > 10;
  const showAlertaFeedbackBaixo = indicadores && indicadores.mediaFeedback < 5;
  const showAlertaLembretes = indicadores && indicadores.lembretesPendentes > 0;

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-8">
        <h1 className="text-3xl font-bold font-quicksand mb-2">Dashboard</h1>

        {/* ALERTAS (condicionais) */}
        <div className="space-y-2">
          {showAlertaFeedbackRuim && (
            <div className="rounded-lg bg-pink-100 p-3 text-pink-800">
              <strong>Atenção:</strong> Há um número elevado de feedbacks ruins.
            </div>
          )}
          {showAlertaFeedbackBaixo && (
            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-800">
              <strong>Alerta:</strong> A média de feedback está baixa.
            </div>
          )}
          {showAlertaLembretes && (
            <div className="rounded-lg bg-blue-100 p-3 text-blue-800">
              Você tem {indicadores?.lembretesPendentes} lembrete(s) pendente(s).
            </div>
          )}
        </div>

        {/* 1) Linha de KPI Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Total de Consultas</CardTitle>
              <CardDescription>Consultas registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.totalConsultas}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Total de Pacientes</CardTitle>
              <CardDescription>Pacientes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.totalPacientes}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Total de Médicos</CardTitle>
              <CardDescription>Médicos ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.totalMedicos}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tempo Médio de Espera</CardTitle>
              <CardDescription>Em minutos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.tempoMedioEspera} min
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 2) Linha de Gráficos: Consultas Agendadas (Line) e Tempo de Espera (Line) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Consultas Agendadas por Dia</CardTitle>
              <CardDescription>Distribuição ao longo dos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigConsultas} className="h-72">
                <LineChart
                  data={consultasAgendadas}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="consult_data" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegendContent verticalAlign="top" />
                  <Line
                    type="monotone"
                    dataKey="total_consultas"
                    stroke="var(--color-consultas)"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tempo Médio de Espera</CardTitle>
              <CardDescription>Média de espera (min) por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigTempoEspera} className="h-72">
                <LineChart
                  data={tempoEspera}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="consult_data" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegendContent verticalAlign="top" />
                  <Line
                    type="monotone"
                    dataKey="tempo_medio_espera"
                    stroke="var(--color-tempo)"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3) Linha de Gráficos: Status (Pizza) e Especialidades (Barras) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Consultas por Status</CardTitle>
              <CardDescription>Visão de status das consultas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-72">
                <PieChart>
                  <Pie
                    data={consultasStatus}
                    dataKey="total"
                    nameKey="status_consulta"
                    outerRadius={100}
                    label
                  >
                    {consultasStatus.map((item, idx) => {
                      const fillColor =
                        chartStatusColors[item.status_consulta] ||
                        pastelColors[idx % pastelColors.length];
                      return <Cell key={item.status_consulta} fill={fillColor} />;
                    })}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegendContent verticalAlign="top" />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Consultas por Especialidade</CardTitle>
              <CardDescription>Áreas mais demandadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-72">
                <BarChart
                  data={consultasEspecialidade}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="espec_nome" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegendContent verticalAlign="top" />
                  <Bar dataKey="total">
                    {consultasEspecialidade.map((entry, index) => {
                      const fillColor =
                        chartEspecialidadeColors[entry.espec_nome] ||
                        pastelColors[index % pastelColors.length];
                      return <Cell key={entry.espec_nome} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* 4) Linha com mais 3 KPI Cards (ex: Feedbacks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Média de Feedback</CardTitle>
              <CardDescription>Notas dos pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.mediaFeedback.toFixed(1)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Feedbacks Ruins</CardTitle>
              <CardDescription>Nota abaixo de 5</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.totalFeedbackRuim}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Lembretes Pendentes</CardTitle>
              <CardDescription>Para envio a pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {indicadores?.lembretesPendentes}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
