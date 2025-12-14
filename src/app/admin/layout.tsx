import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Users,
  Settings,
  BarChart3,
  Calendar,
  Zap,
  ClipboardCheck,
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">AI</span>
            </div>
            <span className="font-bold">Admin</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Posts
            </Button>
          </Link>
          <Link href="/admin/generate">
            <Button variant="ghost" className="w-full justify-start">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generator
            </Button>
          </Link>
          <Link href="/admin/batch">
            <Button variant="ghost" className="w-full justify-start">
              <Zap className="mr-2 h-4 w-4" />
              Batch Generator
            </Button>
          </Link>
          <Link href="/admin/review">
            <Button variant="ghost" className="w-full justify-start">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Review Queue
            </Button>
          </Link>
          <Link href="/admin/scheduled">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Scheduled Tasks
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-2xl font-bold">Editorial Dashboard</h1>
            <Button asChild>
              <Link href="/">View Site</Link>
            </Button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
