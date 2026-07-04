import { SITE_URL, SITE_NAME, DESCRIPTION } from './metadata'

const LOGO_URL = `${SITE_URL}/assets/flower%202.png`

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description: DESCRIPTION,
    email: 'favourajokubi@gmail.com',
    foundingDate: '2026',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
    },
    areaServed: ['NG', 'US', 'GB', 'CA', 'AU'],
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'favourajokubi@gmail.com',
    },
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
    inLanguage: 'en',
  }
}

export function buildBreadcrumbs(
  crumbs: { name: string; path?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${SITE_URL}${crumb.path}` } : {}),
    })),
  }
}

export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: DESCRIPTION,
    url: SITE_URL,
    image: LOGO_URL,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
    },
  }
}
