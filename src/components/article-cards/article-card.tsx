import Link from 'next/link'
import Image from 'next/image'
import { Clock, User, TrendingUp, Tag, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export type ArticleType = 'news' | 'feature' | 'deal' | 'review' | 'opinion'

export interface ArticleCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: Date | string
  category: string
  categorySlug: string
  type: ArticleType
  image?: string
  featured?: boolean
  trending?: boolean
  tags?: string[]
  // Deal-specific fields
  dealPrice?: string
  dealOriginalPrice?: string
  dealDiscount?: string
  // Review-specific fields
  rating?: number
}

export function ArticleCard({
  id,
  slug,
  title,
  excerpt,
  author,
  publishedAt,
  category,
  categorySlug,
  type,
  image,
  featured = false,
  trending = false,
  tags,
  dealPrice,
  dealOriginalPrice,
  dealDiscount,
  rating,
}: ArticleCardProps) {
  const href = `/${categorySlug}/${slug}`

  // Handle both Date objects and ISO strings
  const publishedDate = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true })

  // Different styling based on type
  const cardClasses = cn(
    'group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg',
    featured ? 'md:col-span-2' : '',
    type === 'deal' && 'border-orange-500/20 bg-orange-50/5 dark:bg-orange-950/10'
  )

  return (
    <Link href={href} className={cardClasses}>
      <article className="flex h-full flex-col">
        {/* Image Section (if present) */}
        {image && (
          <div className={cn(
            'relative w-full overflow-hidden bg-muted',
            featured ? 'aspect-[21/9]' : 'aspect-video'
          )}>
            <Image
              src={image}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlays for trending/type badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              {trending && (
                <Badge className="bg-orange-500 hover:bg-orange-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Trending
                </Badge>
              )}
              {type === 'deal' && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  <DollarSign className="mr-1 h-3 w-3" />
                  Deal
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          {/* Metadata Row */}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={publishedDate.toISOString()} className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </time>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {author}
            </span>
            <span>•</span>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className={cn(
            'mb-2 font-bold leading-tight transition-colors group-hover:text-primary',
            featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl',
            !image && featured && 'text-3xl md:text-4xl'
          )}>
            {title}
          </h3>

          {/* Excerpt/Dek */}
          <p className={cn(
            'mb-3 text-sm text-muted-foreground line-clamp-3',
            featured && 'text-base line-clamp-4'
          )}>
            {excerpt}
          </p>

          {/* Deal-specific pricing */}
          {type === 'deal' && dealPrice && (
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dealPrice}
              </span>
              {dealOriginalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {dealOriginalPrice}
                </span>
              )}
              {dealDiscount && (
                <Badge variant="destructive" className="ml-auto">
                  {dealDiscount} OFF
                </Badge>
              )}
            </div>
          )}

          {/* Review-specific rating */}
          {type === 'review' && rating && (
            <div className="mb-3 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-lg',
                    i < rating ? 'text-yellow-500' : 'text-gray-300'
                  )}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-sm font-medium">{rating}/5</span>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1 pt-2">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="mr-1 h-2.5 w-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
