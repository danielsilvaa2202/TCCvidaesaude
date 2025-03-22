import ConsultaMedicoPage from '@/features/consultasmedico'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/consultasmedico/')({
  component: ConsultaMedicoPage
})
