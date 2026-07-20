import { createFileRoute } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@lpg/ui'
import { useAuthStore } from '@/store/auth-store'

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfilePage,
})

function initials(first?: string, last?: string) {
  const f = first?.trim().charAt(0) ?? ''
  const l = last?.trim().charAt(0) ?? ''
  const s = (f + l).toUpperCase()
  return s || '?'
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between py-2'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium'>{value || '—'}</span>
    </div>
  )
}

function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return (
      <div className='mx-auto max-w-2xl p-6'>
        <Card>
          <CardContent className='p-6 text-sm text-muted-foreground'>
            Aucune information utilisateur disponible.
          </CardContent>
        </Card>
      </div>
    )
  }
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  return (
    <div className='mx-auto max-w-2xl p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Avatar className='size-14'>
              <AvatarFallback className='text-base'>
                {initials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{fullName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className='mb-2' />
          <Row label='Prénom' value={user.firstName ?? ''} />
          <Row label='Nom' value={user.lastName ?? ''} />
          <Row label='Email' value={user.email} />
        </CardContent>
      </Card>
    </div>
  )
}
