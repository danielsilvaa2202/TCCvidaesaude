import { IconCalendarStats } from '@tabler/icons-react'

export default function ComingSoon() {
  return (
    <div className='h-svh flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <div className="flex justify-center">
          <IconCalendarStats size={72} className="text-primary" />
        </div>
        <h1 className='text-2xl font-bold leading-tight text-red-600'>O MIT ainda não está disponível no site da Receita Federal (E-CAC)</h1>
        <p className='text-lg text-muted-foreground'>
          Liberação prevista para <strong>2ª Quinzena de Fevereiro</strong>
        </p>
      </div>
    </div>
  )
}
