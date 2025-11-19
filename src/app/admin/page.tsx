import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Eye, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  // TODO: Fetch real stats from database
  const stats = {
    totalPosts: 243,
    totalUsers: 1523,
    totalViews: 45678,
    monthlyGrowth: 23.5,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your AI-powered editorial dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2k from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">Monthly growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Latest published articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* TODO: Map over real posts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">iPhone 15 Pro Review</p>
                  <p className="text-sm text-muted-foreground">Published 2 hours ago</p>
                </div>
                <span className="text-sm text-muted-foreground">234 views</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Best Laptops 2024</p>
                  <p className="text-sm text-muted-foreground">Published 5 hours ago</p>
                </div>
                <span className="text-sm text-muted-foreground">567 views</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI in Tech News</p>
                  <p className="text-sm text-muted-foreground">Published 1 day ago</p>
                </div>
                <span className="text-sm text-muted-foreground">892 views</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Tasks</CardTitle>
            <CardDescription>Upcoming automated content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Tech News Roundup</p>
                  <p className="text-sm text-muted-foreground">Scheduled for 9:00 AM</p>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Newsletter</p>
                  <p className="text-sm text-muted-foreground">Scheduled for Friday</p>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product Reviews Update</p>
                  <p className="text-sm text-muted-foreground">Scheduled for Monday</p>
                </div>
                <span className="text-xs text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
