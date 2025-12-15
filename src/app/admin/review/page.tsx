        },
include: {
    categories: {
        select: { name: true, slug: true, color: true },
    },
    tags: {
        select: { name: true, slug: true },
    },
},
orderBy: { createdAt: 'desc' },
    })

// Get stats
const stats = await db.post.groupBy({
    by: ['status'],
    _count: true,
})

return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold">Review Queue</h2>
            <p className="text-muted-foreground">
                Approve or reject AI-generated content before publishing
            </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
            {['IN_REVIEW', 'DRAFT', 'PUBLISHED', 'REJECTED'].map((status) => {
                const stat = stats.find((s) => s.status === status)
                return (
                    <div
                        key={status}
                        className="rounded-lg border bg-card p-4 text-center"
                    >
                        <div className="text-2xl font-bold">{stat?._count || 0}</div>
                        <div className="text-sm text-muted-foreground">
                            {status.replace('_', ' ')}
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Review Queue */}
        <ReviewQueueClient initialPosts={pendingPosts} />
    </div>
)
}
