import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "600"] });

const SITE_URL = 'https://givita.app'
const SITE_NAME = 'Givita'
const TITLE = `${SITE_NAME} - Africa’s Community-Powered Fundraising Platform`
const DESCRIPTION =
  'Givita turns the way African communities already support each other into a modern, trusted digital experience - built for us, by us. Add your voice to the first survey.'
const KEYWORDS = [
  'Givita',
  'African fundraising',
  'community crowdfunding',
  'Nigeria',
  'diaspora giving',
  'community-powered',
  'transparent fundraising',
  'Odogwu',
  'campaign platform',
]
const OG_IMAGE = '/assets/flower 2.png'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'community',
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: OG_IMAGE, type: 'image/png' },
    ],
    apple: OG_IMAGE,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 1200,
        alt: SITE_NAME,
      },
    ],
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: '@givita',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body className={`${onest.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
