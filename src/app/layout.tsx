import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Scrapbook — make something beautiful',
  description: 'A Canva-style scrapbook maker. Cut, paste, and craft personal scrapbook pages for every moment.',
}

export const viewport: Viewport = {
  themeColor: '#d4a96a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#f0d9b5',
              color: '#2c1a0e',
              border: '1.5px solid #d4a96a',
              fontFamily: "'Caveat', cursive",
              fontSize: '16px',
              boxShadow: '2px 3px 0 rgba(160,112,64,.35)',
            },
          }}
        />
      </body>
    </html>
  )
}
