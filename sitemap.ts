import { MetadataRoute } from 'next'

const baseUrl = 'https://bandyscars.com'

// Static public pages
const staticPages = [
  {
    path: '',
    priority: 1.0,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/about',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/legal',
    priority: 0.6,
    changeFrequency: 'yearly' as const,
  },
  {
    path: '/privacy-policy',
    priority: 0.6,
    changeFrequency: 'yearly' as const,
  },
  {
    path: '/terms-of-service',
    priority: 0.6,
    changeFrequency: 'yearly' as const,
  },
  {
    path: '/faqs',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/press',
    priority: 0.5,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/careers',
    priority: 0.6,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/bandyscars-guide',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/partnership',
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/our-offices',
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/cancellation-policy',
    priority: 0.6,
    changeFrequency: 'yearly' as const,
  },
  {
    path: '/community-guidelines',
    priority: 0.5,
    changeFrequency: 'yearly' as const,
  },
  {
    path: '/nondiscrimination-policy',
    priority: 0.5,
    changeFrequency: 'yearly' as const,
  },
  {
    path: '/how-bandys-works',
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  },
  {
    path: '/support',
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/cars/fleet',
    priority: 0.9,
    changeFrequency: 'daily' as const,
  },
]

// Location pages - high priority for local SEO
const locationPages = [
  {
    path: '/location-agadir',
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/location-casablanca',
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/location-fes',
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/location-marrakech',
    priority: 0.9,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/location-rabat',
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
  {
    path: '/location-tanger',
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  },
]

export default async function sitemap({
  params,
}: {
  params: { locale: string }
}): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()
  const urls: MetadataRoute.Sitemap = []
  const locale = params.locale

  const allPages = [...staticPages, ...locationPages]

  for (const page of allPages) {
    const pagePath = page.path === '' ? '' : page.path
    const urlPath = `${baseUrl}/${locale}${pagePath}`

    urls.push({
      url: urlPath,
      lastModified: currentDate,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Sort URLs by priority (highest first) for better SEO
  return urls.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

export const revalidate = 3600 // Revalidating every hour
