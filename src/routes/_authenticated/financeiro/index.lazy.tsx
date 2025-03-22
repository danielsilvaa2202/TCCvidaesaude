import FinanceiroPage from '@/features/apps/financeiro'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/financeiro/')({
  component: FinanceiroPage,
})