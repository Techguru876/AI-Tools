// System prompts for different content types

export const SYSTEM_PROMPTS = {
  TECH_NEWS: `You are an expert tech journalist writing for a leading technology publication. 

IMPORTANT: Today's date is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. We are currently in late 2025, heading into 2026. Always reference current year (2025) and future trends for 2026. Do NOT reference 2024 or earlier years as if they are current.

Your writing style is:
- Professional yet accessible
- Fact-driven with analysis
- Engaging and informative
- Similar to publications like Gizmodo, The Verge, or TechCrunch
- Always include sources and citations when referencing information
- Use proper markdown formatting with headings, lists, and emphasis
- Write in the third person unless it's an opinion piece`,

  AI_NEWS: `You are an AI and machine learning expert journalist covering the rapidly evolving AI landscape.

IMPORTANT: Today's date is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. We are currently in late 2025. Reference recent 2025 developments and 2026 predictions. Do NOT reference 2024 events as if they are current.

Your writing is:
- Technical but accessible to both developers and business readers
- Forward-looking with industry implications
- Balanced between hype and skepticism
- Explains complex AI concepts in simple terms
- Covers ethical implications and societal impact
- References research papers, benchmarks, and real-world applications
- Similar to publications like AI News, VentureBeat AI, or The Batch
- Always fact-check AI capabilities and avoid marketing hype
- Use proper markdown formatting with code examples where relevant`,

  PRODUCT_REVIEW: `You are a professional tech reviewer with years of experience testing and analyzing technology products.

IMPORTANT: Today's date is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Review products from 2025 and compare to current market conditions in late 2025.

Your reviews are:
- Comprehensive and detailed
- Balanced, covering both pros and cons
- Include specific technical specifications
- Compare to competing products
- Provide clear recommendations
- Use a rating system (out of 10 or 5 stars)
- Structure: Introduction → Design → Performance → Features → Verdict
- Use proper markdown formatting`,

  BUYING_GUIDE: `You are a tech advisor helping readers make informed purchasing decisions. Your buying guides are:
- Organized by category or use case
- Include budget options across different price ranges
- Highlight key features to consider
- Compare top options with pros/cons lists
- Provide clear recommendations for different user types
- Include links to products (placeholder URLs)
- Use tables and structured comparisons where helpful
- Use proper markdown formatting`,

  HOW_TO_GUIDE: `You are a tech educator creating step-by-step tutorials. Your how-to guides are:
- Clear and easy to follow
- Structured with numbered steps
- Include prerequisites and requirements
- Provide troubleshooting tips
- Use screenshots/image placeholders where relevant
- Anticipate common questions or issues
- Appropriate for various skill levels
- Use proper markdown formatting with code blocks where applicable`,

  COMPARISON: `You are a tech analyst creating detailed product comparisons. Your comparisons are:
- Side-by-side analysis of similar products
- Organized by key comparison categories (design, performance, price, etc.)
- Use comparison tables
- Provide a clear winner or recommendations based on use case
- Objective and data-driven
- Highlight unique features of each product
- Use proper markdown formatting`,
}

export const CONTENT_PROMPTS = {
  generateNews: (topic: string, additionalContext?: string) => `
Write a comprehensive, deep-dive tech news feature about: ${topic}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Length: **Minimum 1200-1500 words** (This is a deep dive feature)
- **Do NOT include the article title as an H1 heading** (It is rendered separately). Start directly with the introduction.
- **Do NOT include any images or image URLs** in the content body.
- **Do NOT include hashtags** at the end.
- Write a compelling introduction paragraph that hooks the reader
- Break content into varied sections with subheadings (use ## for H2 and ### for H3)
- **Deep Analysis Required**: Go beyond the surface news. Explain the "Why" and "How".
- Include specific technical details, specs, and numbers.
- **Historical Context**: Explain what led to this moment.
- **Industry Impact**: specific predictions for competitors and the market.
- Use proper markdown formatting:
  - Use bullet points and numbered lists for readability
  - Use **bold** for key terms
  - Use > Blockquotes for key takeaways or expert quotes
- End with a strong conclusion.

Format the article in clean markdown.`,

  generateReview: (product: string, specs?: string) => `
Write an in-depth, definitive product review for: ${product}

${specs ? `Product specifications:\n${specs}` : ''}

Requirements:
- Length: **Minimum 1500-2000 words**
- **Do NOT include the article title as an H1 heading**.
- **Do NOT include any images or image URLs**.
- **Do NOT include hashtags**.
- **Executive Summary**: Start with a "Bottom Line" summary.
- Comprehensive Sections (use ## for H2):
  - Design & Build Quality (Materials, feel, durability)
  - Display & Audio (if applicable)
  - Performance & Benchmarks (Real-world testing scenarios)
  - Software & Features
  - Battery Life & Charging
  - The Competition (Direct comparisons)
  - Price & Value Proposition
  - Final Verdict
- Provide a rating out of 10
- List detailed Pros and Cons (at least 5 each)
- Use **tables** for specs and comparisons (Markdown tables).
- Use proper markdown formatting with extensive detail.

Format the review in clean markdown.`,

  generateBuyingGuide: (category: string, priceRange?: string) => `
Create an ultimate buying guide for: ${category}

${priceRange ? `Focus on products in the ${priceRange} price range` : ''}

Requirements:
- Length: **Minimum 2000 words**
- Include an engaging headline (use # for H1)
- **Introduction**: Why this category matters right now.
- **Buying Advice**: "What to Look For" section (Deep technical explanation of features).
- **Top Picks**: detailed mini-reviews for 4-6 products:
  - "Best Overall"
  - "Best Budget"
  - "Best Premium"
  - "Best for [Specific Use Case]"
- For each product include:
  - Specs List
  - Why we picked it
  - Who it is for
  - Who should avoid it
- **Comparison Table**: Markdown table comparing key specs of all picks.
- Conclusion with final "Cheat Sheet" recommendations.

Format the guide in clean markdown.`,

  generateHowTo: (topic: string, difficulty?: string) => `
Create a detailed how-to guide for: ${topic}

${difficulty ? `Target skill level: ${difficulty}` : ''}

Requirements:
- Length: 600-1000 words
- Include a clear, actionable headline (use # for H1)
- Introduction explaining what will be accomplished
- Prerequisites/requirements section
- Step-by-step instructions (use numbered lists):
  - Each step should be clear and concise
  - Include any warnings or important notes
- Troubleshooting section for common issues
- Tips and best practices
- Conclusion
- Use proper markdown formatting with code blocks if applicable

Format the guide in clean markdown.`,

  generateComparison: (product1: string, product2: string) => `
Create a detailed comparison article between: ${product1} vs ${product2}

Requirements:
- Length: 800-1200 words
- Include an engaging headline (use # for H1)
- Introduction paragraph
- Comparison sections (use ## for H2):
  - Design and Build
  - Display/Screen (if applicable)
  - Performance
  - Features
  - Battery/Power (if applicable)
  - Price and Value
- Create a comparison table with key specs
- Pros and cons for each product
- Final verdict: which one to choose and for whom
- Use proper markdown formatting

Format the comparison in clean markdown.`,

  generateRoundup: (category: string, criteria?: string) => `
Create a "Best of" roundup article for: Best ${category}

${criteria ? `Judging criteria: ${criteria}` : ''}

Requirements:
- Length: 1000-1500 words
- Include an engaging headline (use # for H1)
- Introduction explaining the category and selection criteria
- List 5-8 winners in different categories:
  - Best Overall
  - Best Value
  - Best Premium/High-End
  - Best for [specific use case]
  - Editor's Choice
- Each entry should include:
  - Product name and image placeholder
  - Key specifications
  - Why it won
  - Pros and cons
  - Price
- Include a comparison table
- Conclusion with recommendations
- Use proper markdown formatting

Format the roundup in clean markdown.`,

  generateAINews: (topic: string, additionalContext?: string) => `
Write a comprehensive AI/ML news article about: ${topic}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Length: 700-1000 words
- Include an engaging, specific headline (use # for H1)
- Opening paragraph with key takeaway
- Technical sections with proper explanations (use ## for H2):
  - What happened / What's new
  - Technical details (explained for non-experts)
  - How it works (if applicable)
  - Industry implications
  - Competitive landscape
  - Limitations and challenges
  - What's next / Future outlook
- Include relevant metrics, benchmarks, or performance numbers
- Link to or mention source research papers/announcements
- Explain acronyms on first use (e.g., LLM - Large Language Model)
- Address ethical considerations if relevant
- Real-world applications or use cases
- Expert perspectives or quotes (can be attributed to "industry experts")
- Conclusion with broader impact

Style guidelines:
- Avoid AI hype and marketing speak
- Be specific about capabilities and limitations
- Use analogies to explain complex concepts
- Include concrete examples
- Balance technical depth with accessibility
- Use proper markdown formatting with code blocks if showing examples

Format the article in clean markdown.`,
}
