import 'dotenv/config'
import { db } from '../src/lib/db'

// Improved image generation based on article content
function getContextualImage(title: string, tags: string[]): string {
    // Map specific topics to better Unsplash queries
    const imageMap: Record<string, string> = {
        'Apple': 'apple-technology-device',
        'Google': 'google-workspace-technology',
        'OpenAI': 'artificial-intelligence-future',
        'GPT': 'ai-neural-network',
        'Meta': 'virtual-reality-metaverse',
        'Llama': 'artificial-intelligence-code',
        'MacBook': 'macbook-pro-workspace',
        'Samsung': 'samsung-galaxy-smartphone',
        'Copilot': 'coding-programming-ai',
        'AI': 'artificial-intelligence-technology',
        'Machine Learning': 'machine-learning-data',
        'Neural': 'neural-network-ai',
    }

    // Find the best matching keyword
    for (const [keyword, query] of Object.entries(imageMap)) {
        if (title.includes(keyword) || tags.some(tag => tag.includes(keyword))) {
            return `https://source.unsplash.com/1200x630/?${query}`
        }
    }

    // Fallback to tag-based image
    const primaryTag = tags[0]?.toLowerCase().replace(/\s+/g, '-') || 'technology'
    return `https://source.unsplash.com/1200x630/?${primaryTag},tech,professional`
}

async function main() {
    console.log('🌱 Starting comprehensive seed with improved imagery...')

    // Seed articles with realistic content and contextual images
    const articles = [
        // Tech News Articles
        {
            title: 'Apple Unveils Revolutionary M4 Pro Chip with 40% Faster AI Processing',
            slug: 'apple-m4-pro-chip-ai-december-2025',
            excerpt: 'Apple announces the M4 Pro chip in December 2025, featuring groundbreaking neural engine improvements and 40% faster machine learning performance compared to M3 Pro.',
            content: `# Apple Unveils Revolutionary M4 Pro Chip

*December 11, 2025* - Apple has announced its latest breakthrough in silicon technology with the M4 Pro chip, unveiled today at their special event in Cupertino.

## Key Features

- **40% faster ML performance** compared to M3 Pro
- Enhanced Neural Engine with 32 cores
- 20% improvement in power efficiency
- Support for up to 192GB unified memory

## Impact on Professional Workflows

Content creators and developers are already seeing significant improvements:
- Video rendering speeds increased by 35%
- Code compilation times reduced by 28%
- Real-time AI model training capabilities
- Enhanced real-time effects processing

The M4 Pro represents Apple's continued commitment to delivering professional-grade performance while maintaining industry-leading power efficiency. Early benchmarks show it outperforming competitors in both single-core and multi-core tasks.`,
            contentType: 'NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            categorySlug: 'tech',
            tags: ['Apple', 'M4 Pro', 'Hardware', 'AI', 'Processors', '2025'],
            viewCount: 1250,
        },
        {
            title: 'Google Announces December 2025 Search Algorithm Update Targeting AI Content Quality',
            slug: 'google-algorithm-update-ai-content-december-2025',
            excerpt: 'Google\'s latest search algorithm update, rolled out December 2025, introduces sophisticated AI content detection to ensure high-quality, human-reviewed content ranks higher.',
            content: `# Google's December 2025 Algorithm Update

*December 8, 2025* - Google has rolled out a major algorithm update specifically addressing the quality of AI-generated content across the web.

## What Changed

The update introduces sophisticated detection mechanisms:
- Advanced detection of purely AI-generated articles
- Content quality scoring based on human oversight
- Penalty for low-effort content farms
- Rewards for AI-assisted but human-reviewed content

## Impact on Publishers

Website owners should take immediate action:
1. Ensure human review and editing of all AI-assisted content
2. Add genuine expertise and original insights
3. Focus on providing unique value to readers
4. Implement quality control processes

Google's John Mueller emphasized: "AI tools themselves aren't the issue—it's the quality and originality of the final content that matters for rankings in late 2025 and beyond."

Early reports suggest that sites with proper human oversight have seen ranking improvements, while automated content farms have experienced significant drops.`,
            contentType: 'NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            categorySlug: 'tech',
            tags: ['Google', 'SEO', 'AI', 'Search', 'Algorithm', '2025'],
            viewCount: 890,
        },

        // AI News Articles
        {
            title: 'OpenAI Unveils GPT-5 in December 2025: Breakthrough in Reasoning and Context',
            slug: 'openai-gpt5-launch-december-2025',
            excerpt: 'OpenAI officially launches GPT-5 this month, marking a quantum leap in language understanding with 1M token context windows and 3x better reasoning capabilities.',
            content: `# GPT-5 Launches: December 2025

*December 10, 2025* - OpenAI has officially launched GPT-5 today, marking what many are calling the most significant advancement in AI language models since GPT-4.

## Major Improvements

### Enhanced Reasoning
- **3x better** at complex problem-solving versus GPT-4o
- Improved logical consistency across long conversations
- Superior handling of nuanced, multi-step questions
- Near-human performance on advanced mathematics

### Extended Context Window
- Revolutionary **1 million token support**
- Maintains perfect coherence across 500+ page documents
- Superior conversation memory spanning days
- Enables entirely new use cases for long-form analysis

### Multimodal Capabilities
- Native image understanding and generation
- Real-time audio processing and synthesis
- Video analysis and summarization
- Seamless cross-modal reasoning

## Real-World Applications

Early adopters are already leveraging GPT-5 across industries:
- **Healthcare**: Advanced diagnostic support and medical literature analysis
- **Legal**: Contract analysis and legal research automation
- **Software**: Full-stack development assistance and code review
- **Creative**: Enhanced writing, editing, and content strategy

The model represents a significant step toward AGI capabilities, with OpenAI CEO Sam Altman noting it's "the first model that truly feels like a thinking partner rather than a tool."`,
            contentType: 'AI_NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            categorySlug: 'ai-news',
            tags: ['OpenAI', 'GPT-5', 'LLM', 'AI', '2025', 'Machine Learning'],
            viewCount: 2150,
        },
        {
            title: 'Meta\'s Llama 4 December 2025 Release Challenges Proprietary AI Models',
            slug: 'meta-llama-4-release-december-2025',
            excerpt: 'Meta releases Llama 4 in December 2025, achieving state-of-the-art coding performance that rivals and often surpasses Claude and GPT-4, completely open-source.',
            content: `# Llama 4: Open Source AI Dominance

*December 6, 2025* - Meta has released Llama 4 this month, achieving remarkable performance that challenges the notion that proprietary models are inherently superior.

## Benchmark Results (December 2025)

| Model | HumanEval | MBPP | Avg |
|-------|-----------|------|-----|
| **Llama 4** | **89.2%** | **86.5%** | **87.9%** |
| Claude 4.5 | 87.1% | 84.2% | 85.7% |
| GPT-5 | 88.5% | 85.8% | 87.2% |

## Why This Matters for 2026

The open-source nature of Llama 4 provides unprecedented advantages:
- **Zero API costs** for developers
- **Complete control** over deployment and data
- **Customization** through fine-tuning for specific needs
- **Privacy preservation** with local execution
- **Community innovation** accelerating improvements

## Industry Response

Major tech companies are already integrating Llama 4:
- Canonical has optimized it for Ubuntu Server
- Microsoft offers it in Azure ML
- Amazon Web Services has dedicated Llama 4 instances

Meta's Chief AI Scientist Yann LeCun stated: "This proves open source can not only compete with but surpass closed models. The future of AI is open."`,
            contentType: 'AI_NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            categorySlug: 'ai-news',
            tags: ['Meta', 'Llama 4', 'Open Source', 'Coding', '2025', 'AI'],
            viewCount: 1567,
        },

        // Product Reviews
        {
            title: '2025 MacBook Pro M4 Review: The Ultimate Creative Powerhouse',
            slug: 'macbook-pro-m4-2025-review',
            excerpt: 'After two weeks with the December 2025 MacBook Pro M4, we put Apple\'s latest flagship through rigorous testing. Here\'s our comprehensive review.',
            content: `# MacBook Pro M4 2025: Comprehensive Review

*Reviewed: December 2025*

## Design and Build Quality ⭐⭐⭐⭐⭐

The 2025 MacBook Pro M4 maintains Apple's signature premium build with notable refinements:
- Thinner bezels (15% reduction from 2024 model)
- Improved Magic Keyboard with better tactile feedback
- Enhanced cooling system (20% quieter under full load)
- New Midnight color option with improved fingerprint resistance

## Performance ⭐⭐⭐⭐⭐

The M4 chip delivers exceptional performance in Q4 2025:
- **4K ProRes Export**: 35% faster than M3 Pro
- **Xcode Compilation**: 28% improvement on large projects
- **Blender BMW Render**: 42% faster than competition
- **AI Model Training**: 2x faster ML training

## Battery Life ⭐⭐⭐⭐½

Real-world testing (December 2025):
- 4K video playback: 21 hours
- Web browsing: 17 hours
- Heavy development: 12 hours
- Light productivity: 18+ hours

## Display ⭐⭐⭐⭐⭐

The Liquid Retina XDR display remains best-in-class:
- 3024 x 1964 resolution
- 1600 nits sustained, 1000 nits SDR
- ProMotion 120Hz
- Perfect for HDR content creation

## Verdict (December 2025)

**Rating: 9.5/10**

**Pros:**
- Industry-leading performance
- Exceptional battery life
- Best laptop display available
- Professional-grade build quality

**Cons:**
- Premium pricing ($2,499+)
- Limited to 3 Thunderbolt ports
- Heavy for frequent travel (4.7 lbs)

The 2025 MacBook Pro M4 is unquestionably the best laptop for creative professionals. If you can afford it, it's worth every penny.`,
            contentType: 'REVIEW',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            categorySlug: 'reviews',
            tags: ['Apple', 'MacBook', 'M4', 'Review', 'Laptop', '2025'],
            viewCount: 3421,
        },
        {
            title: 'Samsung Galaxy S25 Ultra Review: December 2025\'s Best Android Phone',
            slug: 'samsung-galaxy-s25-ultra-review-2025',
            excerpt: 'Samsung\'s December 2025 flagship S25 Ultra combines cutting-edge AI features with improved cameras and the best display on any smartphone.',
            content: `# Samsung Galaxy S25 Ultra: December 2025 Review

*Reviewed: December 2025*

## Display ⭐⭐⭐⭐⭐

The 6.8" Dynamic AMOLED is the best smartphone display in 2025:
- 3200 x 1440 resolution (QHD+)
- 1-120Hz adaptive LTPO
- 2600 nits peak brightness (industry record)
- Best outdoor visibility ever tested

## Camera System ⭐⭐⭐⭐⭐

Samsung's late-2025 camera improvements:
- 200MP main sensor with AI noise reduction
- 50MP 5x telephoto (improved from S24)
- 50MP ultrawide with macro mode
- 12MP front camera with AI beautification

The new Galaxy AI photography features make this the smartest camera phone of 2025.

## Performance (December 2025) ⭐⭐⭐⭐⭐

Snapdragon 8 Gen 3 delivers:
- Smooth multitasking
- Console-quality gaming
- Fast app launches
- AI processing on-device

## S Pen Integration ⭐⭐⭐⭐

The included S Pen remains unmatched:
- 9ms latency (improved from 2024)
- AI gesture controls
- Remote camera shutter
- Perfect for productivity

## Battery Life ⭐⭐⭐⭐

5000mAh battery performance:
- 8-9 hours screen time
- Full day heavy use
- 45W fast charging
- Wireless PowerShare

## Verdict (December 2025)

**Rating: 9.3/10**

**Pros:**
- Best Android display period
- Exceptional camera system
- S Pen included
- Premium build and materials
- 7 years of updates promised

**Cons:**
- Expensive ($1,299)
- Large and heavy
- No charger included
- Bixby still inferior to Google Assistant

The S25 Ultra is the best Android phone you can buy in late 2025. It's the complete package.`,
            contentType: 'REVIEW',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            categorySlug: 'reviews',
            tags: ['Samsung', 'Android', 'S25 Ultra', 'Smartphone', 'Review', '2025'],
            viewCount: 2890,
        },
    ]

    console.log('📝 Creating articles with contextual images...')

    for (const article of articles) {
        const { categorySlug, tags, ...articleData } = article

        // Find the category
        const category = await db.category.findUnique({
            where: { slug: categorySlug },
        })

        if (!category) {
            console.log(`⚠️  Category ${categorySlug} not found, skipping: ${article.title}`)
            continue
        }

        // Create or find tags
        const tagRecords = []
        for (const tagName of tags) {
            const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')
            let tag = await db.tag.findUnique({ where: { slug: tagSlug } })

            if (!tag) {
                tag = await db.tag.create({
                    data: {
                        name: tagName,
                        slug: tagSlug,
                    },
                })
            }
            tagRecords.push(tag)
        }

        // Generate contextual cover image
        const coverImage = getContextualImage(article.title, tags)

        // Check if article already exists
        const existing = await db.post.findUnique({
            where: { slug: article.slug },
        })

        if (existing) {
            console.log(`⏭️  Skipping existing article: ${article.title}`)
            continue
        }

        // Create the article
        const post = await db.post.create({
            data: {
                ...articleData,
                coverImage,
                isAiGenerated: false,
                categories: {
                    connect: { id: category.id },
                },
                tags: {
                    connect: tagRecords.map((t) => ({ id: t.id })),
                },
            },
        })

        console.log(`✅ Created: ${post.title}`)
        console.log(`   Image: ${coverImage}`)
    }

    console.log('\n🎉 Seeding complete with improved imagery!')
    console.log(`✅ Processed ${articles.length} articles`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
