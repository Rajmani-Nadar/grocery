import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'Grocery - Fresh Groceries at Your Doorstep',
    template: '%s | Grocery',
  },
  description:
    'Shop fresh groceries online - fruits, vegetables, dairy, bakery, and more. Fast delivery, best prices, and premium quality guaranteed.',
  keywords: [
    'grocery store',
    'online grocery',
    'fresh fruits',
    'vegetables',
    'dairy products',
    'grocery delivery',
  ],
  authors: [{ name: 'Grocery Team' }],
  creator: 'Grocery Team',
  publisher: 'Grocery Inc',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://grocery.example.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://grocery.example.com',
    title: 'Grocery - Fresh Groceries at Your Doorstep',
    description:
      'Shop fresh groceries online with fast delivery and best prices.',
    siteName: 'Grocery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grocery - Fresh Groceries at Your Doorstep',
    description:
      'Shop fresh groceries online with fast delivery and best prices.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
