import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function ScheduledPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Scheduled Tasks</h2>
                <p className="text-muted-foreground">Manage automated content generation</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Coming Soon
                    </CardTitle>
                    <CardDescription>
                        Scheduled task management is being developed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This feature will allow you to schedule automatic content generation at specific times.
                        For now, use the <a href="/admin/batch" className="text-primary hover:underline">Batch Generator</a> to manually trigger content generation.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
