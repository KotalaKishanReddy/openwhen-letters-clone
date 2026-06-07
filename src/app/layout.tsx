import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'openwhen — personal letters',
  description: 'Private digital open when letters, just for you two.',
}

// Bug fix: themeColor moved to viewport export — deprecated in Next.js 14.2+ inside metadata
export const viewport: Viewport = {
  themeColor: '#3d2c1e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#fdf8f3', color: '#3d2c1e', border: '1px solid rgba(61,44,30,.1)' }
          }}
        />
      </body>
    </html>
  )
}
