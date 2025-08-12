import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/frontend/components/providers/ThemeProvider'
import { AuthProvider } from '@/frontend/components/providers/AuthProvider'
import { ToastProvider } from '@/frontend/components/ui/Toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Traflow - AI交易复盘账本',
  description: '社区型的交易复盘记录平台，支持AI智能点评',
  keywords: ['交易', '复盘', 'AI', '社区', '加密货币'],
  authors: [{ name: 'Traflow Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}