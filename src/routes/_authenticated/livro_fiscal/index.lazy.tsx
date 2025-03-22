import LivroFiscal from '@/features/apps/livro_fiscal'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/livro_fiscal/')({
  component: LivroFiscal,
})