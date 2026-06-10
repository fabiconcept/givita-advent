/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['172.20.10.3'],
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          ...(isDev
            ? []
            : [{
                key: 'Content-Security-Policy',
                value: [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "img-src 'self' data: blob: https://secret-room.sirv.com https://www.google-analytics.com https://vercel.live",
                  "font-src 'self' https://fonts.gstatic.com",
                  "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com",
                  "frame-src 'self' https://vercel.live",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                ].join('; '),
              },
            ]),
        ],
      },
    ]
  },
}

export default nextConfig
