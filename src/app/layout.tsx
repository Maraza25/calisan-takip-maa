import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Navbar from '@/components/Navbar'
import { SiteProvider } from '@/contexts/SiteContext'

const geistSans = localFont({
  src: [
    {
      path: './fonts/GeistVF.woff',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = localFont({
  src: [
    {
      path: './fonts/GeistMonoVF.woff',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Çalışan Takip Sistemi - MAA Mimarlık',
  description: 'Çalışan yoklama ve takip sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <ThemeProvider>
          <SiteProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
            </div>
          </SiteProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
