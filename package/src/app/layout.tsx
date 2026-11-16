import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import './receipt-print.css'
import Header from '@/app/components/Layout/Header'
import Footer from '@/app/components/Layout/Footer'
import ScrollToTop from '@/app/components/ScrollToTop'
import ContactBubble from '@/app/components/ContactBubble'
import SchoolStructuredData from './components/SchoolStructuredData'
import { pageMetadata, schoolName, siteDescription, siteUrl } from './seo'

const font = Inter({ subsets: ['latin'] })

// Serve fresh page responses with Next.js's private, no-store cache policy.
export const dynamic = 'force-dynamic'

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: schoolName,
  title: {
    default: 'SMPIT Cendekia Purwakarta',
    template: '%s | SMPIT Cendekia Purwakarta',
  },
  description: siteDescription,
  openGraph: pageMetadata('/', schoolName).openGraph,
  twitter: pageMetadata('/', schoolName).twitter,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id' data-scroll-behavior='smooth'>
      <body className={font.className}>
        <Suspense fallback={null}><SchoolStructuredData /></Suspense>
        <Header />
        {/* Anchor async route hydration separately from the shared layout siblings. */}
        <Suspense fallback={null}>{children}</Suspense>
        <Footer />
        <ContactBubble />
        <ScrollToTop />
      </body>
    </html>
  )
}
