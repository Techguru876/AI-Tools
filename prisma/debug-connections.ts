import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testConnections() {
    console.log('dY"? Starting diagnostics...')

    // 1. Test Database
    try {
        console.log('1Л,?ГЯЬ Testing Database Connection...')
        const count = await db.post.count()
        console.log(`   Гo. Database connected! Found ${count} posts.`)
    } catch (e) {
        console.error('   Г?O Database connection failed:', e)
    }

    // 2. Test Network (OpenAI API via Fetch)
    try {
        console.log('\n2Л,?ГЯЬ Testing OpenAI API (Fetch)...')
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing')

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-5-mini',
                messages: [{ role: 'user', content: 'Hello' }],
                max_completion_tokens: 10
            })
        })

        if (response.ok) {
            const data = await response.json()
            console.log(`   Гo. OpenAI API Responded: ${JSON.stringify(data.choices[0].message.content)}`)
        } else {
            console.error(`   Г?O OpenAI API Error: ${response.status} ${response.statusText}`)
            const text = await response.text()
            console.error('   Response:', text)
        }
    } catch (e) {
        console.error('   Г?O Network request failed:', e)
    }

    console.log('\ndY?? Diagnostics complete.')
}

testConnections()
    .finally(async () => {
        await db.$disconnect()
    })
