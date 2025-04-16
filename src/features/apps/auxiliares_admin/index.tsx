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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Cargo { id_cargo: number; cargo_nome: string; }
interface Especialidade { id_especialidade: number; espec_nome: string; }
interface TipoConsulta { id_tipo_consulta: number; tipoconsulta_nome: string; }
interface StatusConsulta { id_consult_status: number; status_consulta: string; }
interface Alergia { id_alergia: number; alergia_nome: string; }
interface Doenca { id_doenca: number; doenca_nome: string; }
interface DoencaFamiliar { id_doenca_familiar: number; doenca_familiar_nome: string; }
interface Medicamento { id_medicamento: number; medicamento_nome: string; medicamento_posologia: string; }
interface Duracao { id_duracao_med: number; duracao: string; id_medicamento: number; }

const topNavLinks = [
  { title: "Início", href: "/", isActive: false, disabled: false },
  { title: "Profissionais", href: "/profissionais", isActive: false, disabled: false },
  { title: "Auxiliares", href: "/auxiliares", isActive: true, disabled: false },
];

export default function AuxiliaresPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>([]);
  const [statusConsulta, setStatusConsulta] = useState<StatusConsulta[]>([]);
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  const [doencasFamiliares, setDoencasFamiliares] = useState<DoencaFamiliar[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [duracoes, setDuracoes] = useState<Duracao[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create'|'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [campo2, setCampo2] = useState('');
  const [foreignId, setForeignId] = useState<number | ''>('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('Cargos');

  useEffect(() => { fetchAll(); }, []);

  function fetchAll() {
    fetch('/api/cargos').then(r=>r.json()).then(setCargos);
    fetch('/api/especialidades').then(r=>r.json()).then(setEspecialidades);
    fetch('/api/tiposconsulta').then(r=>r.json()).then(setTiposConsulta);
    fetch('/api/statusconsulta').then(r=>r.json()).then(setStatusConsulta);
    fetch('/api/alergias').then(r=>r.json()).then(setAlergias);
    fetch('/api/doencas').then(r=>r.json()).then(setDoencas);
    fetch('/api/doencasfamiliares').then(r=>r.json()).then(setDoencasFamiliares);
    fetch('/api/medicamentos').then(r=>r.json()).then(setMedicamentos);
    fetch('/api/duracoes-medicamento').then(r=>r.json()).then(setDuracoes);
  }

  function openCreate(tab: string) {
    setDialogMode('create'); setSelectedId(null);
    setNome(''); setCampo2(''); setForeignId('');
    setCurrentTab(tab); setDialogOpen(true);
  }

  function openEdit(tab: string, id: number, data: any) {
    setDialogMode('edit'); setSelectedId(id);
    setNome(data.nome); setCampo2(data.campo2 || '');
    setForeignId(data.foreignId || ''); setCurrentTab(tab);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!selectedId) return;
    const endpoint = apiMap[currentTab];
    fetch(`/api/${endpoint}/${selectedId}`, { method: 'DELETE' })
      .then(() => { fetchAll(); setAlertOpen(false); });
  }

  const apiMap: Record<string,string> = {
    'Cargos':'cargos','Especialidades':'especialidades','TiposConsulta':'tiposconsulta','StatusConsulta':'statusconsulta',
    'Alergias':'alergias','Doencas':'doencas','DoencasFamiliares':'doencasfamiliares','Medicamentos':'medicamentos','Duracoes':'duracoes-medicamento'
  };

  const labelsMap: Record<string, {head:string[], fields:string[]}> = {
    'Cargos':{ head:['ID','Cargo'], fields:['id_cargo','cargo_nome'] },
    'Especialidades':{ head:['ID','Nome'], fields:['id_especialidade','espec_nome'] },
    'TiposConsulta':{ head:['ID','Tipo'], fields:['id_tipo_consulta','tipoconsulta_nome'] },
    'StatusConsulta':{ head:['ID','Status'], fields:['id_consult_status','status_consulta'] },
    'Alergias':{ head:['ID','Alergia'], fields:['id_alergia','alergia_nome'] },
    'Doencas':{ head:['ID','Doça'], fields:['id_doenca','doenca_nome'] },
    'DoencasFamiliares':{ head:['ID','Doça Familiar'], fields:['id_doenca_familiar','doenca_familiar_nome'] },
    'Medicamentos':{ head:['ID','Medicamento','Posologia'], fields:['id_medicamento','medicamento_nome','medicamento_posologia'] },
    'Duracoes':{ head:['ID','Medicamento','Duração'], fields:['id_duracao_med','id_medicamento','duracao'] },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const endpoint = apiMap[currentTab];
    const payload: any = {};
    if (currentTab==='Medicamentos') {
      payload.medicamento_nome = nome;
      payload.medicamento_posologia = campo2;
    } else if (currentTab==='Duracoes') {
      payload.id_medicamento = foreignId;
      payload.duracao = nome;
    } else {
      const field = labelsMap[currentTab].fields[1];
      payload[field] = nome;
    }
    const method = dialogMode==='create'?'POST':'PUT';
    const url = dialogMode==='create'? `/api/${endpoint}` : `/api/${endpoint}/${selectedId}`;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => { fetchAll(); setDialogOpen(false); });
  }

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto pr-4"><ProfileDropdown /></div>
      </Header>
      <main className="p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
  <h1 className="text-3xl font-bold font-quicksand">Cadastro Auxiliares - Administrador</h1>
</div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="flex flex-wrap gap-2">
            {Object.keys(apiMap).map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(apiMap).map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="shadow-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>{tab}</CardTitle>
                  <Button onClick={() => openCreate(tab)}>Adicionar</Button>
                </CardHeader>
                <Separator />
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {labelsMap[tab].head.map(h => <TableHead key={h}>{h}</TableHead>)}
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(
                          { 'Cargos': cargos, 'Especialidades': especialidades, 'TiposConsulta': tiposConsulta,
                            'StatusConsulta': statusConsulta, 'Alergias': alergias, 'Doencas': doencas,
                            'DoencasFamiliares': doencasFamiliares, 'Medicamentos': medicamentos, 'Duracoes': duracoes }
                          [tab] as any[]
                        ).map(item => (
                          <TableRow key={item[labelsMap[tab].fields[0]]}>
                            {labelsMap[tab].fields.map(f => <TableCell key={f}>{item[f]}</TableCell>)}
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(tab, item[labelsMap[tab].fields[0]], {
                                  nome: item[labelsMap[tab].fields[1]], campo2: item[labelsMap[tab].fields[2]], foreignId: item['id_medicamento'] })}>
                                  Editar
                                </Button>
                                <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                                      <AlertDialogDescription>Esta ação não poderá ser desfeita.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableCaption>
                        Total de {
                          { 'Cargos': cargos.length, 'Especialidades': especialidades.length,
                            'TiposConsulta': tiposConsulta.length, 'StatusConsulta': statusConsulta.length,
                            'Alergias': alergias.length, 'Doencas': doencas.length,
                            'DoencasFamiliares': doencasFamiliares.length, 'Medicamentos': medicamentos.length,
                            'Duracoes': duracoes.length }[tab]
                        } registro(s)
                      </TableCaption>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Adicionar' : 'Editar'} {currentTab}</DialogTitle>
            <DialogDescription>Preencha os campos abaixo</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>{currentTab === 'Duracoes' ? 'Duração' : 'Nome'} *</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              {currentTab === 'Medicamentos' && (
                <div className="flex flex-col gap-1">
                  <Label>Posologia *</Label>
                  <Input value={campo2} onChange={e => setCampo2(e.target.value)} required />
                </div>
              )}
              {currentTab === 'Duracoes' && (
                <div className="flex flex-col gap-1">
                  <Label>Medicamento *</Label>
                  <select
                    value={foreignId}
                    onChange={e => setForeignId(Number(e.target.value))}
                    required
                    className="border rounded p-2"
                  >
                    <option value="">Selecione...</option>
                    {medicamentos.map(m => (
                      <option key={m.id_medicamento} value={m.id_medicamento}>{m.medicamento_nome}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">{dialogMode === 'create' ? 'Adicionar' : 'Salvar'}</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
