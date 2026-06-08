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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ShortcutGuardProvider>
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </ShortcutGuardProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
