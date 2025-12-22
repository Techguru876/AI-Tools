import { db } from '@/lib/db'
import { users, posts } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

// Force dynamic rendering - admin pages need database access
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const usersResult = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(50)

    // Fetch post counts for each user
    const usersWithCounts = await Promise.all(
        usersResult.map(async (user) => {
            const postCountResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(posts)
                .where(eq(posts.authorId, user.id))

            return {
                ...user,
                _count: {
                    posts: Number(postCountResult[0]?.count ?? 0),
                },
            }
        })
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Users</h2>
                <p className="text-muted-foreground">Manage authors and contributors</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Users ({usersWithCounts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {usersWithCounts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No users found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">Title</th>
                                        <th className="px-4 py-3 text-left font-medium">Posts</th>
                                        <th className="px-4 py-3 text-left font-medium">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersWithCounts.map((user) => (
                                        <tr key={user.id} className="border-t hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{user.name || 'Unknown'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.title || '-'}</td>
                                            <td className="px-4 py-3">{user._count.posts}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
