import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Button, Card, CardContent, CardFooter, Input, Label, Checkbox } from '@lpg/ui'
import { PasswordInput } from '@/components/password-input'
import csphLogo from '@/assets/logo-csph-small.png'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('superadmin@lpg.cm')
  const [password, setPassword] = useState('password')
  const [termsAccepted, setTermsAccepted] = useState(false)
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
    <div className="grid min-h-screen lg:grid-cols-5">
      <div className="hidden lg:flex lg:col-span-2 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-2">
            <img src={csphLogo} alt="CSPH" className="h-10 w-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              CSPH
            </h2>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Console de gestion de flotte. Connectez-vous pour accéder à votre
              espace de travail.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CSPH. Tous droits réservés.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 lg:col-span-3 bg-background">
        <Card className="w-full max-w-md border shadow-sm">
          <CardContent className="pt-8 pb-6">
            <div className="flex justify-center mb-6 lg:hidden">
              <img src={csphLogo} alt="CSPH" className="h-12 w-auto" />
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold tracking-tight">
                Connexion
              </h1>
              <p className="text-sm text-muted-foreground">
                Connectez-vous à la console de gestion de flotte
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !termsAccepted}
              >
                {submitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked as boolean)
                }
              />
              <Label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-relaxed"
              >
                J'accepte les{' '}
                <Link
                  to="/terms"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link
                  to="/terms"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  politique de confidentialité
                </Link>
              </Label>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
