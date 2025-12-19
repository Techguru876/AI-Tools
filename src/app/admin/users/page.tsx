import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default async function UsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            _count: { select: { posts: true } },
        },
    })

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
                        All Users ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
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
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-t hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{user.name || 'Unknown'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground">-</td>
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
