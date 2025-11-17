import { MetadataRoute } from 'next'

// Root sitemap index that points to locale-specific sitemaps
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bandyscars.com'
  const locales = ['en-US', 'fr-FR', 'es-ES', 'ar-MA'] as const
  
  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}/sitemap.xml`,
    lastModified: new Date(),
  }))
}
