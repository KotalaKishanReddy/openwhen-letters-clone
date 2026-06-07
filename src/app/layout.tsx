import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'openwhen — personal letters',
  description: 'Private digital open when letters, just for you two.',
  themeColor: '#3d2c1e'
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
