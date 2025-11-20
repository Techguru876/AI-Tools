import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techfrontier.com'

  // Static pages
  const staticPages = [
    '',
    '/tech',
    '/science',
    '/culture',
    '/reviews',
    '/deals',
    '/ai-news',
    '/about',
    '/our-team',
    '/advertise',
    '/contact',
    '/newsletter',
    '/media-kit',
    '/support',
    '/rss',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/affiliate-disclosure',
  ]

  const staticSitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Add dynamic article pages when database is connected
  // const articles = await db.post.findMany({
  //   where: { status: 'PUBLISHED' },
  //   select: { slug: true, updatedAt: true, category: true },
  // })
  //
  // const articleSitemap = articles.map((article) => ({
  //   url: `${baseUrl}/${article.category}/${article.slug}`,
  //   lastModified: article.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }))

  return staticSitemap
}
