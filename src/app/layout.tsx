import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crashmeter v3',
  description: 'Market crash risk indicator dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
