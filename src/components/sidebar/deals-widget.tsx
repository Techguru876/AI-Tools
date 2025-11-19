import Link from 'next/link'
import Image from 'next/image'
import { DollarSign, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Mock featured deals - will be replaced with real data
const featuredDeals = [
  {
    id: '1',
    productName: 'AirPods Pro (2nd Gen)',
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=300&fit=crop',
    currentPrice: '$199',
    originalPrice: '$249',
    discount: '20%',
    slug: 'airpods-pro-deal',
  },
  {
    id: '2',
    productName: 'Samsung Galaxy S24',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    currentPrice: '$699',
    originalPrice: '$899',
    discount: '22%',
    slug: 'samsung-galaxy-s24-deal',
  },
  {
    id: '3',
    productName: 'MacBook Air M3',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    currentPrice: '$999',
    originalPrice: '$1,199',
    discount: '17%',
    slug: 'macbook-air-m3-deal',
  },
]

export function DealsWidget() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold">Featured Deals</h3>
      </div>

      <div className="space-y-4">
        {featuredDeals.map((deal) => (
          <Link
            key={deal.id}
            href={`/deals/${deal.slug}`}
            className="group block overflow-hidden rounded-lg border bg-gradient-to-br from-green-50/50 to-transparent transition-shadow hover:shadow-md dark:from-green-950/20"
          >
            {/* Product Image */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={deal.image}
                alt={deal.productName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute right-2 top-2 bg-red-600 hover:bg-red-700">
                {deal.discount} OFF
              </Badge>
            </div>

            {/* Deal Info */}
            <div className="p-3">
              <h4 className="mb-2 line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                {deal.productName}
              </h4>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {deal.currentPrice}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {deal.originalPrice}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                asChild
              >
                <span>
                  View Deal
                  <ExternalLink className="ml-2 h-3 w-3" />
                </span>
              </Button>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/deals"
        className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
      >
        View All Deals →
      </Link>
    </div>
  )
}
