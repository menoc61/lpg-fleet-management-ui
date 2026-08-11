import os, re

PRIMITIVES = {
    'Avatar': 'avatar', 'AvatarFallback': 'avatar', 'AvatarImage': 'avatar',
    'Badge': 'badge', 'Button': 'button',
    'Calendar': 'calendar',
    'Card': 'card', 'CardContent': 'card', 'CardDescription': 'card', 'CardFooter': 'card', 'CardHeader': 'card', 'CardTitle': 'card',
    'Checkbox': 'checkbox',
    'Collapsible': 'collapsible', 'CollapsibleContent': 'collapsible', 'CollapsibleTrigger': 'collapsible',
    'CommandDialog': 'command', 'CommandInput': 'command', 'CommandList': 'command', 'CommandEmpty': 'command', 'CommandGroup': 'command', 'CommandItem': 'command',
    'Dialog': 'dialog', 'DialogContent': 'dialog', 'DialogFooter': 'dialog', 'DialogHeader': 'dialog', 'DialogTitle': 'dialog',
    'Drawer': 'drawer', 'DrawerContent': 'drawer', 'DrawerHeader': 'drawer', 'DrawerTitle': 'drawer',
    'DropdownMenu': 'dropdown-menu', 'DropdownMenuContent': 'dropdown-menu', 'DropdownMenuItem': 'dropdown-menu', 'DropdownMenuLabel': 'dropdown-menu', 'DropdownMenuSeparator': 'dropdown-menu', 'DropdownMenuTrigger': 'dropdown-menu', 'DropdownMenuGroup': 'dropdown-menu',
    'Form': 'form', 'FormControl': 'form', 'FormField': 'form', 'FormItem': 'form', 'FormLabel': 'form', 'FormMessage': 'form',
    'Input': 'input', 'Label': 'label',
    'Popover': 'popover', 'PopoverContent': 'popover', 'PopoverTrigger': 'popover',
    'RadioGroup': 'radio-group', 'ScrollArea': 'scroll-area',
    'Select': 'select', 'SelectContent': 'select', 'SelectItem': 'select', 'SelectTrigger': 'select', 'SelectValue': 'select',
    'Separator': 'separator',
    'Sheet': 'sheet', 'SheetContent': 'sheet', 'SheetHeader': 'sheet', 'SheetTitle': 'sheet', 'SheetDescription': 'sheet',
    'Sidebar': 'sidebar', 'SidebarContent': 'sidebar', 'SidebarFooter': 'sidebar', 'SidebarHeader': 'sidebar', 'SidebarRail': 'sidebar',
    'SidebarGroup': 'sidebar', 'SidebarGroupLabel': 'sidebar', 'SidebarMenuSub': 'sidebar', 'SidebarMenuSubButton': 'sidebar', 'SidebarMenuSubItem': 'sidebar',
    'SidebarInset': 'sidebar', 'SidebarMenu': 'sidebar', 'SidebarMenuButton': 'sidebar', 'SidebarMenuItem': 'sidebar', 'SidebarProvider': 'sidebar', 'SidebarTrigger': 'sidebar',
    'Skeleton': 'skeleton', 'Switch': 'switch',
    'Table': 'table', 'TableBody': 'table', 'TableCell': 'table', 'TableFooter': 'table', 'TableHead': 'table', 'TableHeader': 'table', 'TableRow': 'table',
    'Tabs': 'tabs', 'TabsContent': 'tabs', 'TabsList': 'tabs', 'TabsTrigger': 'tabs',
    'Textarea': 'textarea', 'Tooltip': 'tooltip', 'TooltipContent': 'tooltip', 'TooltipTrigger': 'tooltip',
    'useSidebar': 'sidebar',
}

DATA_TABLE = {
    'DataTable': 'data-table/data-table',
    'DataTableBulkActions': 'data-table/bulk-actions',
    'DataTableColumnHeader': 'data-table/column-header',
    'DataTablePagination': 'data-table/pagination',
    'DataTableToolbar': 'data-table/toolbar',
}

UTILS = {'cn'}

def classify(name):
    if name in PRIMITIVES: return ('ui', PRIMITIVES[name])
    if name in DATA_TABLE: return ('dt', DATA_TABLE[name])
    if name in UTILS: return ('utils', 'utils')
    return (None, None)

def process(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    pat = r"import \{([^}]+)\} from '@lpg/ui'"
    ms = list(re.finditer(pat, content))
    if not ms: return False
    reps = []
    for m in ms:
        names = [n.strip() for n in m.group(1).split(',') if n.strip()]
        groups = {}
        for name in names:
            kind, lp = classify(name)
            if kind is None:
                print('UNKNOWN', name, path)
                continue
            groups.setdefault((kind, lp), []).append(name)
        lines = []
        for (kind, lp), ns in groups.items():
            imp = ', '.join(ns)
            if kind == 'ui':
                lines.append("import { " + imp + " } from '@/components/ui/" + lp + "'")
            elif kind == 'dt':
                lines.append("import { " + imp + " } from '@/components/" + lp + "'")
            elif kind == 'utils':
                lines.append("import { " + imp + " } from '@/lib/" + lp + "'")
        reps.append((m.start(), m.end(), '\n'.join(lines)))
    for s, e, r in reversed(reps):
        content = content[:s] + r + content[e:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

root = r'C:\Users\DTA_WorkStation\Documents\manga\lpg-fleet-management-ui\apps\web\src'
count = 0
for dp, dn, fns in os.walk(root):
    for fn in fns:
        if fn.endswith(('.tsx', '.ts')) and not fn.endswith('.d.ts'):
            if process(os.path.join(dp, fn)):
                count += 1
print('Processed', count, 'files')
