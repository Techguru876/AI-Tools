import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Camera,
  Watch,
  Cpu,
  Gamepad2,
} from 'lucide-react'

const categories = [
  { name: 'Smartphones', icon: Smartphone, count: 145, color: 'text-blue-500' },
  { name: 'Laptops', icon: Laptop, count: 98, color: 'text-purple-500' },
  { name: 'Audio', icon: Headphones, count: 76, color: 'text-green-500' },
  { name: 'TV & Home', icon: Tv, count: 54, color: 'text-red-500' },
  { name: 'Cameras', icon: Camera, count: 42, color: 'text-yellow-500' },
  { name: 'Wearables', icon: Watch, count: 67, color: 'text-pink-500' },
  { name: 'PC Hardware', icon: Cpu, count: 89, color: 'text-orange-500' },
  { name: 'Gaming', icon: Gamepad2, count: 123, color: 'text-indigo-500' },
]

export function CategoryGrid() {
  return (
    <section className="container py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Browse by Category</h2>
        <p className="mt-2 text-muted-foreground">
          Explore tech news and reviews across all your favorite categories
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <Link
              key={category.name}
              href={`/category/${category.name.toLowerCase()}`}
              className="reveal-on-scroll"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Card className="interactive-card group h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium transition-colors group-hover:text-primary">
                    {category.name}
                  </CardTitle>
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${category.color}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{category.count}</div>
                  <p className="text-xs text-muted-foreground">articles</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
