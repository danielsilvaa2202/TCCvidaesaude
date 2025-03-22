import FileUploader from '@/features/importador'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/importacao/')({
  component: FileUploader,
})
