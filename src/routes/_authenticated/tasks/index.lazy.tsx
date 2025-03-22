import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/tasks/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/tasks/"!</div>
}
