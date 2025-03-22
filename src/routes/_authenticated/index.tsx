import { createFileRoute } from '@tanstack/react-router'
import EventosPage from '@/features/apps/consultasgestao'

export const Route = createFileRoute('/_authenticated/')({
  component: EventosPage,
})
