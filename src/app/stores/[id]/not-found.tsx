
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Store } from 'lucide-react'

export default function StoreNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <Store className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Store Not Found</h2>
      <p className="text-muted-foreground mb-6">
        Sorry, we couldn&apos;t find the store you&apos;re looking for.
      </p>
      <Button asChild>
        <Link href="/my-stores">Go Back to My Stores</Link>
      </Button>
    </div>
  )
}
