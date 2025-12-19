import { db } from '../src/lib/db'

async function cleanHashtags() {
    console.log('🔍 Checking all articles for hashtags and special characters...\n')

    const posts = await db.post.findMany({
        where: { status: 'PUBLISHED' },
        select: {
            id: true,
            slug: true,
            title: true,
            content: true,
        },
    })

    let updatedCount = 0

    for (const post of posts) {
        let cleanedContent = post.content
        let needsUpdate = false

        // Remove hashtag lines (common patterns at end of articles)
        const hashtagPatterns = [
            // Hashtags at end like: #AI #Tech #OpenAI
            /\n\s*#[\w]+(\s+#[\w]+)*\s*$/g,
            // Multiple hashtags on separate lines
            /\n\s*#[\w]+\s*\n/g,
            // Social media style hashtags
            /\s+#[\w]+(?=\s|$)/g,
        ]

        for (const pattern of hashtagPatterns) {
            if (pattern.test(cleanedContent)) {
                cleanedContent = cleanedContent.replace(pattern, '')
                needsUpdate = true
            }
        }

        // Remove excessive newlines (more than 2 in a row)
        if (/\n{3,}/.test(cleanedContent)) {
            cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n')
            needsUpdate = true
        }

        // Trim trailing whitespace
        const trimmedContent = cleanedContent.trim()
        if (trimmedContent !== post.content) {
            needsUpdate = true
            cleanedContent = trimmedContent
        }

        if (needsUpdate) {
            await db.post.update({
                where: { id: post.id },
                data: { content: cleanedContent },
            })

            console.log(`✅ Cleaned: ${post.title}`)
            updatedCount++
        } else {
            console.log(`✓ Already clean: ${post.title}`)
        }
    }

    console.log(`\n🎉 Finished! Updated ${updatedCount} out of ${posts.length} articles.`)

    await db.$disconnect()
}

cleanHashtags().catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
})
