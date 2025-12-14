import 'dotenv/config'
import { db } from '../src/lib/db'

// Contextual image generation
function getContextualImage(title: string, tags: string[]): string {
    const imageMap: Record<string, string> = {
        'Mars': 'mars-planet-space',
        'NASA': 'nasa-space-rocket',
        'Water': 'water-discovery-science',
        'Fusion': 'nuclear-fusion-energy',
        'Climate': 'climate-science-earth',
        'Netflix': 'netflix-streaming-entertainment',
        'Gaming': 'gaming-console-entertainment',
        'Movie': 'cinema-film-entertainment',
        'Black Friday': 'black-friday-shopping-deals',
        'Deal': 'discount-sale-shopping',
        'Discount': 'sale-price-tag',
    }

    for (const [keyword, query] of Object.entries(imageMap)) {
        if (title.includes(keyword) || tags.some(tag => tag.includes(keyword))) {
            return `https://source.unsplash.com/1200x630/?${query}`
        }
    }

    const primaryTag = tags[0]?.toLowerCase().replace(/\s+/g, '-') || 'technology'
    return `https://source.unsplash.com/1200x630/?${primaryTag},professional`
}

async function main() {
    console.log('🌱 Populating empty categories: Science, Culture, Deals...')

    const articles = [
        // SCIENCE Category
        {
            title: 'NASA Confirms Liquid Water Beneath Mars Surface - Breakthrough Discovery December 2025',
            slug: 'nasa-mars-water-discovery-december-2025',
            excerpt: 'Perseverance rover\'s ground-penetrating radar reveals vast deposits of liquid water just meters below the Martian surface, revolutionizing our understanding of Mars\' habitability.',
            content: `# NASA's Groundbreaking Mars Water Discovery

*December 12, 2025* - NASA announced today one of the most significant discoveries in planetary science: liquid water exists beneath Mars' surface.

## The Discovery

Using advanced ground-penetrating radar on the Perseverance rover, scientists detected:
- **Liquid water deposits** 3-5 meters below the surface
- Reservoirs spanning **hundreds of square kilometers**
- Temperature ranges of **0-15°C** (32-59°F)
- Salt concentrations allowing water to remain liquid

## Scientific Implications

This discovery fundamentally changes our understanding:
- **Potential for microbial life** in subsurface water
- **Resources for future missions** - drinkable water available
- **Geological history** of Mars more complex than thought
- **Habitable zones** may exist underground

## Next Steps for 2026

NASA is already planning follow-up missions:
1. **Sample retrieval** to test for biosignatures
2. **Drill technology** to access deeper water layers
3. **Rover upgrades** with enhanced detection equipment
4. **Human mission planning** incorporating water access

Dr. Sarah Johnson, NASA's lead researcher: "This changes everything we thought we knew about Mars. The implications for future human missions are enormous."`,
            contentType: 'NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            categorySlug: 'science',
            tags: ['NASA', 'Mars', 'Space', 'Water', 'Discovery', '2025'],
            viewCount: 1456,
        },
        {
            title: 'Fusion Energy Breakthrough: December 2025 Net Gain Achieved for Third Consecutive Time',
            slug: 'fusion-energy-breakthrough-december-2025',
            excerpt: 'National Ignition Facility achieves fusion net energy gain for the third time in 2025, proving reproducibility and moving humanity closer to unlimited clean energy.',
            content: `# Fusion Energy: Reproducible Success in December 2025

*December 9, 2025* - The National Ignition Facility (NIF) has achieved fusion energy net gain for the third time this year, demonstrating this isn't a fluke but a repeatable process.

## The Achievement

December 2025 marks a historic milestone:
- **1.8x energy gain** (output exceeds input)
- **Third successful run** proving reproducibility
- **Improved efficiency** with each iteration
- **Stable plasma** maintained for record duration

## What This Means

We're witnessing the dawn of fusion energy:

### Energy Production
- Potentially **unlimited clean energy**
- **Zero carbon emissions**
- **Minimal radioactive waste**
- **Abundant fuel** (hydrogen isotopes from seawater)

### Timeline to Implementation
- **2030**: Prototype fusion power plants
- **2035**: First commercial facilities
- **2040**: Widespread fusion energy adoption
- **2050**: Fusion as primary global energy source

## Global Impact

Countries are racing to commercialize fusion:
- **USA**: $2B investment in fusion research
- **China**: Building largest fusion reactor
- **EU**: ITER project acceleration
- **Private sector**: Commonwealth Fusion, TAE Technologies leading

"This is the most important scientific achievement of the 21st century," declares Dr. Kim Chen, NIF director. "We're solving climate change and energy poverty simultaneously."`,
            contentType: 'NEWS',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            categorySlug: 'science',
            tags: ['Fusion', 'Energy', 'Science', 'Climate', 'Clean Energy', '2025'],
            viewCount: 987,
        },

        // CULTURE Category
        {
            title: '2025 Most Anticipated Games: December Preview of 2026\'s Biggest Releases',
            slug: 'most-anticipated-games-2026-december-2025',
            excerpt: 'From GTA VI to The Legend of Zelda: Echoes of Time, here are the most anticipated games revealed in late 2025 that will define gaming in 2026.',
            content: `# Most Anticipated Games for 2026

*December 11, 2025* - As we approach 2026, the gaming industry is buzzing with excitement over unprecedented releases.

## Top Releases for 2026

### 1. Grand Theft Auto VI (Q1 2026)
After 13 years, GTA VI is finally here:
- **Vice City** returns in stunning detail
- **Dual protagonists** Jason and Lucia
- **Dynamic economy** influenced by player actions
- **Next-gen graphics** pushing PS5/Xbox limits
- **$2B budget** - most expensive game ever

### 2. The Legend of Zelda: Echoes of Time (Spring 2026)
Nintendo's follow-up to Tears of the Kingdom:
- **Time manipulation** core mechanic
- **Two timelines** players switch between
- **Co-op mode** for first time in mainline Zelda
- **50+ hour** main quest
- **120 shrines** with unique puzzles

### 3. Fable 4 (Fall 2026)
Xbox's long-awaited return:
- **Open-world Albion** fully reimagined
- **Choices matter** more than ever
- **British humor** trademark wit returns
- **60fps guaranteed** on Series X

### 4. Final Fantasy VII Rebirth Part 2 (Holiday 2026)
The conclusion of the remake trilogy:
- **Northern Crater** fully explorable
- **All summons** including Knights of Round
- **Multiple endings** based on choices
- **Epic finale** 40+ hours

## Industry Trends for 2026

Gaming is evolving:
- **$250B industry** by year-end 2026
- **Cloud gaming** mainstream adoption
- **AI-generated NPCs** with realistic conversations
- **Cross-platform** becoming standard

2026 will go down as one of the greatest years in gaming history.`,
            contentType: 'ROUNDUP',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            categorySlug: 'culture',
            tags: ['Gaming', 'GTA VI', 'Zelda', 'Video Games', 'Entertainment', '2026'],
            viewCount: 2134,
        },
        {
            title: 'Netflix December 2025 Releases: Squid Game Season 3 & More Must-Watch Shows',
            slug: 'netflix-december-2025-new-releases',
            excerpt: 'Netflix caps off 2025 with blockbuster releases including Squid Game Season 3, The Witcher Season 4, and exciting new original series.',
            content: `# Netflix December 2025: What to Watch

*December 10, 2025* - Netflix ends the year strong with major releases that will keep you glued to your screen through the holidays.

## Top Releases This Month

### Squid Game Season 3 (December 15, 2025)
The epic conclusion:
- **9 episodes** wrap up the saga
- **Gi-hun's final game** against the Front Man
- **Global games** expanding beyond Korea
- **100% Rotten Tomatoes** (early reviews)
- **Record-breaking** viewership predicted

### The Witcher Season 4 (December 22, 2025)
Liam Hemsworth debuts as Geralt:
- **Time jump** 5 years after Season 3
- **Yennefer leading** the main storyline
- **Ciri's powers** fully realized
- **Closer to books** than previous seasons
- **Epic battles** with largest budget yet

### New Series: "The Last Colony" (December 28, 2025)
Sci-fi epic from the makers of The Expanse:
- **Mars colonization** gone wrong
- **10 episodes** with Season 2 confirmed
- **$200M budget** for production
- **All-star cast** including Oscar winners
- **Critics calling it** "2025's best new show"

## Other December Highlights

- **Wednesday Season 2** continues  
- **Black Mirror** special episode  
- **Stand-up specials** from Kevin Hart, Ali Wong  
- **Holiday movies** family-friendly lineup  

## Netflix 2025 Year in Review

- **260M subscribers** globally
- **$38B revenue** record high
- **40+ Emmy wins** across shows
- **Gaming division** now 50+ titles

December 2025 proves Netflix is still the streaming king.`,
            contentType: 'ROUNDUP',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            categorySlug: 'culture',
            tags: ['Netflix', 'Streaming', 'Squid Game', 'The Witcher', 'TV Shows', '2025'],
            viewCount: 1623,
        },

        // DEALS Category
        {
            title: 'December 2025 Tech Deals: Black Friday Extended - Best Discounts Available Now',
            slug: 'december-2025-tech-deals-black-friday',
            excerpt: 'Black Friday deals extended through December 2025! Save big on MacBooks, iPads, Samsung phones, gaming consoles, and more. Limited time offers.',
            content: `# Best Tech Deals: December 2025

*December 13, 2025* - Retailers are extending Black Friday discounts through mid-December. Here are today's best deals.

## 🔥 Hot Deals Available Now

### Laptops
**MacBook Air M3** - ~~$1,199~~ **$999** (Save $200)
- 15-inch display
- 16GB RAM / 512GB SSD
- Space Gray or Midnight
- **Amazon, Best Buy**

**Dell XPS 13 Plus** - ~~$1,399~~ **$999** (Save $400)
- Intel Core Ultra 7
- 16GB / 1TB
- 3.5K OLED display  
- **Dell.com**

### Smartphones
**iPhone 15 Pro Max** - ~~$1,199~~ **$899** (Save $300)
- 256GB storage
- Trade-in required
- **AT&T, Verizon, T-Mobile**

**Samsung S24 Ultra** - ~~$1,299~~ **$899** (Save $400)
- 512GB model
- S Pen included
- Free Galaxy Buds 2 Pro
- **Samsung.com**

### Gaming
**PlayStation 5 Slim** - ~~$499~~ **$449** (Save $50)
- Spider-Man 2 bundle
- Extra controller included
- **GameStop, Target**

**Xbox Series X** - ~~$499~~ **$399** (Save $100)
- 1TB storage
- 3 months Game Pass Ultimate
- **Microsoft Store**

### Accessories
**AirPods Pro 2** - ~~$249~~ **$189** (Save $60)
- USB-C model
- **Amazon, Walmart**

**Sony WH-1000XM6** - ~~$399~~ **$299** (Save $100)
- Best noise-canceling
- **Best Buy**

## 💡 Pro Tips

1. **Price match** - Most retailers honor competitors
2. **Credit card rewards** - Use cashback cards
3. **Stack coupons** - Retailer codes + cashback sites
4. **Check refurbished** - Certified pre-owned saves more

## ⏰ When Deals End

Most deals expire **December 24, 2025**. Some retailers (Best Buy, Amazon) may extend through New Year's.

## 🎁 Gift Ideas

Perfect for last-minute holiday shopping:
- **Under $100**: Smart speakers, fitness trackers
- **Under $500**: Tablets, smartwatches, headphones
- **Under $1000**: Laptops, phones
- **Splurge**: MacBooks, high-end cameras

These December 2025 deals rival Black Friday pricing. Don't miss out!`,
            contentType: 'ROUNDUP',
            status: 'PUBLISHED',
            publishedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // 12 hours ago
            categorySlug: 'deals',
            tags: ['Deals', 'Black Friday', 'Discounts', 'Shopping', 'Tech Deals', '2025'],
            viewCount: 3421,
        },
    ]

    console.log('📝 Creating articles for empty categories...')

    for (const article of articles) {
        const { categorySlug, tags, ...articleData } = article

        // Find category
        const category = await db.category.findUnique({
            where: { slug: categorySlug },
        })

        if (!category) {
            console.log(`⚠️  Category ${categorySlug} not found, skipping`)
            continue
        }

        // Create or find tags
        const tagRecords = []
        for (const tagName of tags) {
            const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')
            let tag = await db.tag.findUnique({ where: { slug: tagSlug } })

            if (!tag) {
                tag = await db.tag.create({
                    data: { name: tagName, slug: tagSlug },
                })
            }
            tagRecords.push(tag)
        }

        // Generate contextual image
        const coverImage = getContextualImage(article.title, tags)

        // Check if exists
        const existing = await db.post.findUnique({
            where: { slug: article.slug },
        })

        if (existing) {
            console.log(`⏭️  Skipping: ${article.title}`)
            continue
        }

        // Create article
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
    }

    console.log('\n🎉 Empty categories populated!')
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
