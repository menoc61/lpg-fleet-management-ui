import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import z from 'zod'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@lpg/ui'
import {
  Bell,
  BookOpen,
  Building2,
  Camera,
  Languages,
  LifeBuoy,
  Lock,
  Mail,
  Moon,
  Pencil,
  Plus,
  Save,
  Send,
  Settings as SettingsIcon,
  Shield,
  Sun,
  Trash2,
  User as UserIcon,
  Volume2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRoleStore } from '@/store/role-store'
import { ROLE_LABELS } from '@/config/rbac/roles'
import { hasPermission } from '@lpg/permissions'
import { usePreferencesStore, type ThemePreference, type LanguagePreference, type DigestFrequency } from '@/store/preferences-store'
import { useTheme } from '@/context/theme-provider'
import {
  useNotificationsStore,
  type NotificationLevel,
} from '@/features/notifications/notifications-store'
import {
  useNotificationGroupsStore,
  type NotificationGroup,
} from '@/features/notifications/notification-groups-store'
import {
  NotificationGroupForm,
  groupToFormValues,
} from '@/features/notifications/notification-group-form'
import type { NotificationGroupFormValues } from '@/features/notifications/notification-group-schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/layout/page'
import { toast } from 'sonner'
import type { Role } from '@/config/rbac/roles'

const profileSearchSchema = z.object({
  tab: z.enum(['informations', 'notifications', 'preferences', 'groups']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/settings/profile')({
  validateSearch: profileSearchSchema,
  component: ProfilePage,
})

function initials(first?: string, last?: string) {
  const f = first?.trim().charAt(0) ?? ''
  const l = last?.trim().charAt(0) ?? ''
  return (f + l).toUpperCase() || '?'
}

interface EditableProfile {
  first_name: string
  last_name: string
  email: string
  phone: string
  bio: string
}

function EditProfileDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: EditableProfile
  onSave: (next: EditableProfile) => void
}) {
  const [draft, setDraft] = useState<EditableProfile>(initial)
  const [saving, setSaving] = useState(false)

  const dirty =
    draft.first_name !== initial.first_name ||
    draft.last_name !== initial.last_name ||
    draft.email !== initial.email ||
    draft.phone !== initial.phone ||
    draft.bio !== initial.bio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      onSave(draft)
      toast.success('Profil mis à jour avec succès.')
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations personnelles. Les changements sont
            enregistrés localement pour la démonstration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='edit-first'>Prénom</Label>
              <Input
                id='edit-first'
                value={draft.first_name}
                onChange={(e) =>
                  setDraft({ ...draft, first_name: e.target.value })
                }
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-last'>Nom</Label>
              <Input
                id='edit-last'
                value={draft.last_name}
                onChange={(e) =>
                  setDraft({ ...draft, last_name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-email'>Adresse email</Label>
            <Input
              id='edit-email'
              type='email'
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-phone'>Téléphone</Label>
            <Input
              id='edit-phone'
              type='tel'
              placeholder='+237 6XX XX XX XX'
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-bio'>Bio</Label>
            <Textarea
              id='edit-bio'
              rows={3}
              placeholder='Une courte description de votre rôle…'
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              className='resize-none'
            />
          </div>
          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type='submit' disabled={!dirty || saving}>
              <Save className='mr-2 h-4 w-4' />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SupportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [category, setCategory] = useState<'bug' | 'data' | 'access' | 'other'>(
    'bug',
  )
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Votre rapport a été envoyé à l\'équipe support.')
      setSubject('')
      setMessage('')
      setCategory('bug')
      onOpenChange(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <LifeBuoy className='h-4 w-4' />
            Contacter le support
          </DialogTitle>
          <DialogDescription>
            Décrivez le problème ou la question. Notre équipe répondra par email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='support-cat'>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger id='support-cat'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bug'>Bug / anomalie technique</SelectItem>
                <SelectItem value='data'>Données incorrectes</SelectItem>
                <SelectItem value='access'>Problème d'accès / permission</SelectItem>
                <SelectItem value='other'>Autre demande</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='support-subj'>Sujet</Label>
            <Input
              id='support-subj'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='Résumé court du problème'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='support-msg'>Message</Label>
            <Textarea
              id='support-msg'
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Décrivez ce que vous avez observé, ce que vous attendiez, et comment reproduire le problème.'
              required
              className='resize-none'
            />
          </div>
          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Annuler
            </Button>
            <Button
              type='submit'
              disabled={!subject || !message || sending}
            >
              <Send className='mr-2 h-4 w-4' />
              {sending ? 'Envoi…' : 'Envoyer le rapport'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NotificationsPanel() {
  const items = useNotificationsStore((s) => s.items)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Centre de notifications. Faites défiler pour charger les alertes
          plus anciennes.
        </CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <ul className='divide-y'>
          {items.length === 0 ? (
            <li className='p-4 text-sm text-muted-foreground'>
              Aucune notification.
            </li>
          ) : (
            items.map((n) => (
              <li key={n.id} className='flex items-start gap-3 p-4'>
                <span
                  aria-hidden='true'
                  className={
                    n.read
                      ? 'mt-1 size-2 shrink-0 rounded-full bg-slate-400'
                      : 'mt-1 size-2 shrink-0 rounded-full bg-emerald-500'
                  }
                />
                <div className='flex-1 space-y-1'>
                  <p className='text-sm font-medium leading-none'>{n.title}</p>
                  <p className='text-sm text-muted-foreground'>{n.body}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

function NotificationGroupsPanel() {
  const items = useNotificationGroupsStore((s) => s.items)
  const addGroup = useNotificationGroupsStore((s) => s.addGroup)
  const updateGroup = useNotificationGroupsStore((s) => s.updateGroup)
  const deleteGroup = useNotificationGroupsStore((s) => s.deleteGroup)
  const user = useAuthStore((s) => s.user)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<NotificationGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NotificationGroup | null>(null)

  const handleCreate = (values: NotificationGroupFormValues) => {
    addGroup({
      name: values.name,
      targetRoles: values.targetRoles as Role[],
      createdBy: user?.email ?? 'unknown',
    })
    toast.success(`Groupe "${values.name}" créé`)
    setDialogOpen(false)
  }

  const handleUpdate = (values: NotificationGroupFormValues) => {
    if (!editingGroup) return
    updateGroup(editingGroup.id, {
      name: values.name,
      targetRoles: values.targetRoles as Role[],
    })
    toast.success(`Groupe "${values.name}" mis à jour`)
    setEditingGroup(null)
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteGroup(deleteTarget.id)
    toast.success(`Groupe "${deleteTarget.name}" supprimé`)
    setDeleteTarget(null)
  }

  const isEditing = editingGroup !== null

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>Groupes de notification</CardTitle>
          <CardDescription>
            Définissez des ensembles de rôles destinataires pour cibler vos
            alertes système.
          </CardDescription>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={() => {
            setEditingGroup(null)
            setDialogOpen(true)
          }}
        >
          <Plus className='mr-2 size-4' />
          Nouveau groupe
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
<EmptyState
              title='Aucun groupe'
              description='Créez votre premier groupe de notification.'
              action={
                <Button
                  type='button'
                  size='sm'
                  onClick={() => {
                    setEditingGroup(null)
                    setDialogOpen(true)
                  }}
                >
                  <Plus className='mr-2 size-4' />
                  Nouveau groupe
                </Button>
              }
            />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Rôles cibles</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className='font-medium'>{group.name}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {group.targetRoles.map((role) => (
                        <Badge key={role} variant='outline' className='text-[10px]'>
                          {ROLE_LABELS[role]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8'
                        onClick={() => {
                          setEditingGroup(group)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className='size-3.5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8 text-destructive'
                        onClick={() => setDeleteTarget(group)}
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingGroup(null)
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier le groupe' : 'Créer un groupe de notification'}
            </DialogTitle>
          </DialogHeader>
          <NotificationGroupForm
            defaultValues={
              isEditing ? groupToFormValues(editingGroup! as NotificationGroup) : undefined
            }
            onSubmit={isEditing ? handleUpdate : handleCreate}
            onCancel={() => {
              setDialogOpen(false)
              setEditingGroup(null)
            }}
            submitLabel={isEditing ? 'Enregistrer' : 'Créer le groupe'}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title='Supprimer le groupe'
        desc={
          <span>
            Êtes-vous sûr de vouloir supprimer le groupe{' '}
            <strong>{deleteTarget?.name}</strong> ?
          </span>
        }
        confirmText='Supprimer'
        destructive
        handleConfirm={handleDelete}
      />
    </Card>
  )
}

function PreferencesPanel() {
  const theme = useTheme()
  const prefs = usePreferencesStore()

  const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: SettingsIcon },
  ]

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'fr-FR', label: 'Français (Cameroun)' },
    { value: 'en-US', label: 'English (United States) — bientôt' },
  ]

  const digestOptions: { value: DigestFrequency; label: string }[] = [
    { value: 'realtime', label: 'Temps réel' },
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'never', label: 'Aucun' },
  ]

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sun className='h-4 w-4' />
            Apparence
          </CardTitle>
          <CardDescription>
            Choisissez le thème de l'interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-2'>
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const active = theme.theme === opt.value
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => prefs.setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/40',
                    active && 'border-primary bg-primary/5',
                  )}
                >
                  <Icon className='size-4' />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Languages className='h-4 w-4' />
            Langue et région
          </CardTitle>
          <CardDescription>
            Langue de l'interface et préférences régionales.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            <Label htmlFor='pref-lang'>Langue</Label>
            <Select
              value={prefs.language}
              onValueChange={(v) => prefs.setLanguage(v as LanguagePreference)}
            >
              <SelectTrigger id='pref-lang'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === 'en-US'}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              D'autres langues seront ajoutées dans une prochaine version.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-4 w-4' />
            Notifications et alertes
          </CardTitle>
          <CardDescription>
            Définissez comment et quand vous recevez les alertes système.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            <Label htmlFor='pref-digest'>Fréquence du résumé email</Label>
            <Select
              value={prefs.emailDigest}
              onValueChange={(v) => prefs.setEmailDigest(v as DigestFrequency)}
            >
              <SelectTrigger id='pref-digest'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {digestOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <ToggleRow
            icon={Bell}
            title='Notifications push navigateur'
            description="Affiche les alertes même quand vous n'êtes pas sur la console."
            checked={prefs.pushEnabled}
            onCheckedChange={prefs.setPushEnabled}
          />
          <ToggleRow
            icon={Volume2}
            title='Sons de notification'
            description="Joue un son à l'arrivée de chaque nouvelle alerte."
            checked={prefs.soundEnabled}
            onCheckedChange={prefs.setSoundEnabled}
          />
          <ToggleRow
            icon={SettingsIcon}
            title='Mode compact'
            description="Réduit la densité d'affichage pour afficher plus d'information par écran."
            checked={prefs.compactMode}
            onCheckedChange={prefs.setCompactMode}
          />
          <ToggleRow
            icon={Shield}
            title='Télémétrie anonyme'
            description="Aide l'équipe à améliorer la console en partageant des statistiques d'usage anonymisées."
            checked={prefs.telemetryOptIn}
            onCheckedChange={prefs.setTelemetryOptIn}
          />
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            prefs.reset()
            theme.resetTheme()
            toast.success('Préférences réinitialisées.')
          }}
        >
          Réinitialiser les préférences
        </Button>
      </div>
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Bell
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className='flex items-center justify-between rounded-lg border p-3'>
      <div className='space-y-0.5'>
        <p className='text-sm font-medium flex items-center gap-2'>
          <Icon className='h-4 w-4 text-muted-foreground' />
          {title}
        </p>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const activeRole = useRoleStore((s) => s.activeRole)
  const roleLabel = ROLE_LABELS[activeRole] ?? activeRole
  const { tab: tabParam } = Route.useSearch()
  const canManageGroups =
    !!user?.system_role && hasPermission(user.system_role as Role, 'notification-groups.write')
  const allowedTabs: Array<'informations' | 'notifications' | 'preferences' | 'groups'> = canManageGroups
    ? ['informations', 'notifications', 'preferences', 'groups']
    : ['informations', 'notifications', 'preferences']
  const initialTab = allowedTabs.includes(tabParam as never)
    ? (tabParam as 'informations' | 'notifications' | 'preferences' | 'groups')
    : 'informations'
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [editOpen, setEditOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [twoFactor, setTwoFactor] = useState(true)

  if (!user) {
    return (
      <div className='mx-auto max-w-3xl p-6'>
        <Card>
          <CardContent className='p-6 text-sm text-muted-foreground'>
            Aucune information utilisateur disponible.
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  const editable: EditableProfile = {
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    email: user.email,
    phone,
    bio,
  }

  return (
    <div className='mx-auto flex max-w-5xl flex-col gap-6 p-6'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Mon profil</h1>
        <p className='text-sm text-muted-foreground'>
          Gérez vos informations personnelles, vos notifications, vos préférences
          et accédez au support.
        </p>
      </header>

      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Avatar className='size-20'>
                  <AvatarFallback className='bg-primary/10 text-2xl font-semibold text-primary'>
                    {initials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type='button'
                  className='absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted'
                  aria-label='Changer la photo'
                  onClick={() =>
                    toast.info('Téléversement d\'avatar — démo')
                  }
                >
                  <Camera className='h-3.5 w-3.5' />
                </button>
              </div>
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='text-xl font-semibold'>{fullName}</h2>
                  <Badge variant='secondary'>{roleLabel}</Badge>
                </div>
                {user.org_name && (
                  <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <Building2 className='h-4 w-4 shrink-0' />
                    <span className='truncate'>{user.org_name}</span>
                  </p>
                )}
                <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Mail className='h-4 w-4 shrink-0' />
                  {user.email}
                </p>
              </div>
            </div>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  toast.info('Documentation — bientôt disponible', {
                    description: 'Le centre de documentation est en cours de rédaction.',
                  })
                }
              >
                <BookOpen className='mr-2 h-4 w-4' />
                Documentation
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => setSupportOpen(true)}
              >
                <LifeBuoy className='mr-2 h-4 w-4' />
                Support
              </Button>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Pencil className='mr-2 h-4 w-4' />
                    Modifier le profil
                  </Button>
                </DialogTrigger>
                <EditProfileDialog
                  open={editOpen}
                  onOpenChange={setEditOpen}
                  initial={editable}
                  onSave={(next) => {
                    updateProfile({
                      first_name: next.first_name,
                      last_name: next.last_name,
                      email: next.email,
                    })
                    setPhone(next.phone)
                    setBio(next.bio)
                  }}
                />
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList
          className={cn(
            'grid w-full',
            canManageGroups ? 'max-w-2xl grid-cols-4' : 'max-w-md grid-cols-3',
          )}
        >
          <TabsTrigger value='informations'>
            <UserIcon className='mr-2 h-4 w-4' />
            Informations
          </TabsTrigger>
          <TabsTrigger value='notifications'>
            <Bell className='mr-2 h-4 w-4' />
            Notifications
          </TabsTrigger>
          <TabsTrigger value='preferences'>
            <SettingsIcon className='mr-2 h-4 w-4' />
            Préférences
          </TabsTrigger>
          {canManageGroups && (
            <TabsTrigger value='groups'>
              <Shield className='mr-2 h-4 w-4' />
              Groupes
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value='informations' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Ces informations sont visibles par les autres utilisateurs de
                votre organisation.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <Field label='Prénom' value={user.first_name} />
                <Field label='Nom' value={user.last_name} />
                <Field label='Email' value={user.email} />
                <Field label='Téléphone' value={phone || '—'} />
              </div>
              <Separator />
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Bio</Label>
                <p className='text-sm text-muted-foreground'>
                  {bio || 'Aucune bio renseignée.'}
                </p>
              </div>
              <Separator />
              <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <p className='text-sm font-medium flex items-center gap-2'>
                    <Lock className='h-4 w-4' />
                    Authentification à deux facteurs
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Ajoutez une couche de sécurité supplémentaire via une
                    application d'authentification.
                  </p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={(v) => {
                    setTwoFactor(v)
                    toast.success(
                      v
                        ? '2FA activée (simulation)'
                        : '2FA désactivée (simulation)',
                    )
                  }}
                />
              </div>
              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  onClick={() =>
                    toast.info('Demande de changement de mot de passe — démo')
                  }
                >
                  <Lock className='mr-2 h-4 w-4' />
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='mt-4 space-y-4'>
          <NotificationsPanel />
          {canManageGroups && (
            <Card>
              <CardHeader>
                <CardTitle>Envoyer une notification</CardTitle>
                <CardDescription>
                  Diffusez une alerte ciblée à un groupe ou à tous les rôles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SendNotificationInline />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='preferences' className='mt-4'>
          <PreferencesPanel />
        </TabsContent>

        {canManageGroups && (
          <TabsContent value='groups' className='mt-4'>
            <NotificationGroupsPanel />
          </TabsContent>
        )}
      </Tabs>

      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  )
}

function SendNotificationInline() {
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const groups = useNotificationGroupsStore((s) => s.items)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [level, setLevel] = useState<NotificationLevel>('info')
  const [target, setTarget] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      let roles: Role[] = []
      if (target) {
        const group = groups.find((g) => g.id === target)
        if (group) {
          roles = group.targetRoles
        }
      }

      for (const role of roles) {
        addNotification({ title, body, level, role })
      }
      if (roles.length === 0) {
        addNotification({ title, body, level })
      }
      toast.success('Notification envoyée.')
      setTitle('')
      setBody('')
      setLevel('info')
      setTarget('')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSend} className='grid gap-3 md:grid-cols-2'>
      <div className='space-y-2 md:col-span-2'>
        <Label htmlFor='send-title'>Titre</Label>
        <Input
          id='send-title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className='space-y-2 md:col-span-2'>
        <Label htmlFor='send-body'>Message</Label>
        <Textarea
          id='send-body'
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          className='resize-none'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='send-level'>Niveau</Label>
        <Select value={level} onValueChange={(v) => setLevel(v as NotificationLevel)}>
          <SelectTrigger id='send-level'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='info'>Information</SelectItem>
            <SelectItem value='success'>Succès</SelectItem>
            <SelectItem value='warning'>Avertissement</SelectItem>
            <SelectItem value='error'>Erreur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='send-target'>Groupe cible</Label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger id='send-target'>
            <SelectValue placeholder='Tous les rôles' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>Tous les rôles</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} ({group.targetRoles.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='md:col-span-2 flex justify-end'>
        <Button
          type='submit'
          disabled={!title || !body || sending}
        >
          <Send className='mr-2 h-4 w-4' />
          {sending ? 'Envoi…' : 'Envoyer'}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs uppercase tracking-wide text-muted-foreground'>
        {label}
      </Label>
      <p className='text-sm font-medium'>{value || '—'}</p>
    </div>
  )
}