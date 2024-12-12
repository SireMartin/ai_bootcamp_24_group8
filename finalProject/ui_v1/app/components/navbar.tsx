import Link from 'next/link'
import { FileText } from 'lucide-react'
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-bold">Document Assistant</span>
        </Link>
        <ModeToggle />
      </div>
    </nav>
  )
}

