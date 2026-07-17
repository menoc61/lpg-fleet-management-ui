import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@lpg/ui'
import csphLogo from '@/assets/logo-csph-small.png'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

// One-click presets for the mock/dev backend (credentials from mock-api fixtures).
const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'superadmin@lpg.cm' },
  { label: 'Admin', email: 'admin@lpg.cm' },
  { label: 'Superviseur', email: 'supervisor@lpg.cm' },
  { label: 'Intégrateur', email: 'integrateur@lpg.cm' },
  { label: 'Agent', email: 'agent@lpg.cm' },
  { label: 'Marketeur', email: 'marketeur@lpg.cm' },
  { label: 'Livreur', email: 'livreur@lpg.cm' },
]

function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('superadmin@lpg.cm')
  const [password, setPassword] = useState('password')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      navigate({ to: '/' })
    } catch (err) {
      toast.error('Échec de la connexion. Vérifiez vos identifiants.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-4 text-center items-center pb-6">
          <img src={csphLogo} alt="CSPH Logo" className="h-16 w-auto mb-2" />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous à la console LPG Fleet
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={submitting}>
              {submitting ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Comptes de démonstration (mock) :</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    type="button"
                    key={a.email}
                    onClick={() => { setEmail(a.email); setPassword('password') }}
                    className="text-xs rounded-full border px-3 py-1 hover:bg-accent transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
