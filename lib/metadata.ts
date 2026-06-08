import type { Metadata } from 'next'

export const SITE_URL = 'https://givita.app'
export const SITE_NAME = 'Givita'
export const TITLE = `${SITE_NAME} - Africa's Community-Powered Fundraising Platform`
export const DESCRIPTION =
  'Givita turns the way African communities already support each other into a modern, trusted digital experience - built for us, by us. Add your voice to the first survey.'
export const KEYWORDS = [
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
export const FAVICON = '/assets/flower 2.png'
export const OG_IMAGE = 'https://secret-room.sirv.com/og-image.jpg'

export function createMetadata(overrides?: Partial<Metadata>): Metadata {
  const base: Metadata = {
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
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    icons: {
      icon: [{ url: FAVICON, type: 'image/png' }],
      apple: FAVICON,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: TITLE,
      description: DESCRIPTION,
      url: SITE_URL,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
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

  if (!overrides) return base

  const merged: Metadata = { ...base, ...overrides }

  if (overrides.openGraph) {
    merged.openGraph = { ...base.openGraph, ...overrides.openGraph }
  }
  if (overrides.twitter) {
    merged.twitter = { ...base.twitter, ...overrides.twitter }
  }
  if (overrides.robots && typeof overrides.robots === 'object') {
    merged.robots = { ...(typeof base.robots === 'object' ? base.robots : {}), ...overrides.robots }
  }

  return merged
}

export function pageTitle(page: string): Metadata {
  return { title: page }
}
