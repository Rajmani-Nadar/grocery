import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Sorry, we couldn't find the page you're looking for. It might have been removed or the link might be incorrect.
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="gap-2">
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  )
}
