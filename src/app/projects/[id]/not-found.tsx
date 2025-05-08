import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
      <p className="text-muted-foreground mb-6">
        Sorry, we couldn&apos;t find the project you&apos;re looking for.
      </p>
      <Button asChild>
        <Link href="/projects">Go Back to All Projects</Link>
      </Button>
    </div>
  )
}
