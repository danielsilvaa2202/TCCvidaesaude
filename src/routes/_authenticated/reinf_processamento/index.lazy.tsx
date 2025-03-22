import ReinfProcessamento from '@/features/reinf_processamento'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/reinf_processamento/',
)({
  component: ReinfProcessamento,
})
