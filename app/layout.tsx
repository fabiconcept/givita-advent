import { Onest } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ShortcutGuardProvider } from '@/components/ShortcutGuard'
import { createMetadata } from '@/lib/metadata'
import './globals.css'

const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = createMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${onest.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2.5 focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ShortcutGuardProvider>
            <main id="main-content">{children}</main>
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </ShortcutGuardProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
