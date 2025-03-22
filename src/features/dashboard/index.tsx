// src/features/dashboard/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { TopNav } from '@/components/layout/top-nav';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,

  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// -------------------------------------------------
// Tipos de dados
// -------------------------------------------------

type StatusType = 'Ativa' | 'Em Fila' | 'Processada' | 'Erro';

interface Company {
  id: number;
  empresa: string;
  cnpj: string;
  razaoSocial: string;
  status: StatusType;
  guia: string;
}

interface ApiResponse {
  data: Company[];
  page: number;
  size: number;
  totalRecords: number;
  statusCounts: {
    [key in StatusType]: number;
  };
}

// -------------------------------------------------
// Componente de Badge de status
// -------------------------------------------------

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<StatusType, string> = {
    Ativa: 'bg-accent text-accent-foreground',
    'Em Fila': 'bg-accent text-accent-foreground',
    Processada: 'bg-primary text-primary-foreground',
    Erro: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Badge className={`${statusStyles[status]} cursor-pointer`}>
      {status}
    </Badge>
  );
};

// -------------------------------------------------
// Links do TopNav (exemplo)
// -------------------------------------------------

const topNav = [
  {
    title: 'Processamento',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Importação',
    href: 'dashboard/customers',
    isActive: true,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: true,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: true,
    disabled: true,
  },
];

// -------------------------------------------------
// Componente principal
// -------------------------------------------------

export default function Dashboard() {
  // Estados
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusType | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Recebido do backend para controle de paginação
  const [totalRecords, setTotalRecords] = useState(0);

  // Para contagens de status
  const [statusCounts, setStatusCounts] = useState<{
    [key in StatusType]?: number;
  }>({});

  const cardsRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------
  // Função para buscar dados da API
  // -------------------------------------------------
  async function fetchCompanies() {
    try {
      // Monte a URL com query params para paginação, busca e filtro.
      // Ajuste conforme sua API de backend.
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('size', itemsPerPage.toString());

      // Se houver texto de busca
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Se houver filtro de status
      if (activeFilter) {
        // Exemplo: ?status=Erro
        params.append('status', activeFilter);
      }

      const response = await fetch(
        `http://10.0.0.147:9999//api/companies/?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da API');
      }

      const jsonData: ApiResponse = await response.json();

      // Atualizar estados com a resposta da API
      setCompanies(jsonData.data);
      setCurrentPage(jsonData.page);
      setItemsPerPage(jsonData.size);
      setTotalRecords(jsonData.totalRecords);
      setStatusCounts(jsonData.statusCounts);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  // -------------------------------------------------
  // useEffect para recarregar dados ao mudar
  // page, itemsPerPage, searchTerm ou activeFilter
  // -------------------------------------------------
  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchTerm, activeFilter]);

  // -------------------------------------------------
  // Para resetar filtro ao clicar fora dos cards
  // -------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardsRef.current && !cardsRef.current.contains(event.target as Node)) {
        // Se quiser que ao clicar fora, volte para "sem filtro"
        // setActiveFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // -------------------------------------------------
  // Cálculo de total de páginas com base no totalRecords
  // -------------------------------------------------
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  return (
    <>
      {/* Header com top nav, tema e perfil */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <main className='p-4'>
        {/* Título */}
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight text-accent'>
            Processamento
          </h1>
        </div>

        {/* Cards de resumo */}
        <div
          className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'
          ref={cardsRef}
        >
          {/* Total */}
          <Card onClick={() => setActiveFilter(null)} className='cursor-pointer'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M12 1v22M5 12h14' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalRecords}
              </div>
            </CardContent>
          </Card>

          {/* Em Fila */}
          <Card
            onClick={() =>
              setActiveFilter((prev) => (prev === 'Em Fila' ? null : 'Em Fila'))
            }
            className='cursor-pointer'
          >
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Fila</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <circle cx='9' cy='9' r='6' />
                <circle cx='15' cy='15' r='6' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {statusCounts['Em Fila'] ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Processadas */}
          <Card
            onClick={() =>
              setActiveFilter((prev) =>
                prev === 'Processada' ? null : 'Processada'
              )
            }
            className='cursor-pointer'
          >
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Processadas</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M20 6L9 17l-5-5' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {statusCounts['Processada'] ?? 0}
              </div>
            </CardContent>
          </Card>

          {/* Erros */}
          <Card
            onClick={() =>
              setActiveFilter((prev) => (prev === 'Erro' ? null : 'Erro'))
            }
            className='cursor-pointer'
          >
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Erros</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <circle cx='12' cy='12' r='10' />
                <line x1='15' y1='9' x2='9' y2='15' />
                <line x1='9' y1='9' x2='15' y2='15' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {statusCounts['Erro'] ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de busca e botão de exportar */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0'>
          <input
            type='text'
            placeholder='Pesquisar por Empresa, CNPJ ou Razão Social'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Sempre que o usuário digitar algo, voltamos para a página 1
              setCurrentPage(1);
            }}
            className='w-full sm:w-1/3 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
          />

          <div className='flex justify-end'>
            <Button className='bg-accent text-accent-foreground hover:bg-accent-light'>
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className='overflow-x-auto mb-6'>
          <Table className='min-w-full divide-y divide-border'>
            <TableHeader>
              <TableRow>
                <TableHead className='px-6 py-3 bg-secondary text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider'>
                  Empresa
                </TableHead>
                <TableHead className='px-6 py-3 bg-secondary text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider'>
                  CNPJ
                </TableHead>
                <TableHead className='px-6 py-3 bg-secondary text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider'>
                  Razão Social
                </TableHead>
                <TableHead className='px-6 py-3 bg-secondary text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider'>
                  Status
                </TableHead>
                <TableHead className='px-6 py-3 bg-secondary text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider'>
                  Guia
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className='bg-background divide-y divide-border'>
              {companies.map((company) => (
                <TableRow key={company.id} className='hover:bg-secondary-light'>
                  <TableCell className='px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground'>
                    {company.empresa}
                  </TableCell>
                  <TableCell className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
                    {company.cnpj}
                  </TableCell>
                  <TableCell className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
                    {company.razaoSocial}
                  </TableCell>
                  <TableCell className='px-6 py-4 whitespace-nowrap text-sm'>
                    <StatusBadge status={company.status} />
                  </TableCell>
                  <TableCell className='px-6 py-4 whitespace-nowrap text-sm text-foreground'>
                    {company.guia}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableCaption className='mt-2 text-sm text-foreground'>
              Lista detalhada das empresas e seus respectivos status.
            </TableCaption>
          </Table>
        </div>

        {/* Paginação */}
        <div className='flex items-center justify-between'>
          <div>
            <label
              htmlFor='itemsPerPage'
              className='mr-2 text-sm text-foreground'
            >
              Itens por página:
            </label>
            <select
              id='itemsPerPage'
              value={itemsPerPage}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setItemsPerPage(newSize);

                // Se o novo total de páginas for menor que a página atual,
                // volte para a última página disponível.
                const newTotalPages = Math.ceil(totalRecords / newSize) || 1;
                if (currentPage > newTotalPages) {
                  setCurrentPage(newTotalPages);
                }
              }}
              className='px-2 py-1 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className='flex space-x-2'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-md ${
                currentPage === 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-background text-foreground hover:bg-secondary-light border-accent'
              }`}
            >
              Anterior
            </button>

            <span className='px-3 py-1 text-sm text-foreground'>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-md ${
                currentPage === totalPages
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-background text-foreground hover:bg-secondary-light border-accent'
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
