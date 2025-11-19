// System prompts for different content types

export const SYSTEM_PROMPTS = {
  TECH_NEWS: `You are an expert tech journalist writing for a leading technology publication. Your writing style is:
- Professional yet accessible
- Fact-driven with analysis
- Engaging and informative
- Similar to publications like Gizmodo, The Verge, or TechCrunch
- Always include sources and citations when referencing information
- Use proper markdown formatting with headings, lists, and emphasis
- Write in the third person unless it's an opinion piece`,

  PRODUCT_REVIEW: `You are a professional tech reviewer with years of experience testing and analyzing technology products. Your reviews are:
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
Write a comprehensive tech news article about: ${topic}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Length: 600-800 words
- Include an engaging headline (use # for H1)
- Write a compelling introduction paragraph
- Break content into sections with subheadings (use ## for H2)
- Include relevant technical details
- Mention potential implications or impact
- End with a brief conclusion or what to watch for next
- Use proper markdown formatting
- If this is about a specific product or company, include background information

Format the article in clean markdown.`,

  generateReview: (product: string, specs?: string) => `
Write a detailed product review for: ${product}

${specs ? `Product specifications:\n${specs}` : ''}

Requirements:
- Length: 800-1200 words
- Include an engaging headline (use # for H1)
- Start with a brief overview and key specs
- Include the following sections (use ## for H2):
  - Design and Build Quality
  - Performance
  - Key Features
  - Battery Life / Longevity (if applicable)
  - Price and Value
  - Verdict
- Provide a rating out of 10
- List clear pros and cons
- Include a final recommendation
- Use proper markdown formatting with lists and emphasis

Format the review in clean markdown.`,

  generateBuyingGuide: (category: string, priceRange?: string) => `
Create a comprehensive buying guide for: ${category}

${priceRange ? `Focus on products in the ${priceRange} price range` : ''}

Requirements:
- Length: 1000-1500 words
- Include an engaging headline (use # for H1)
- Introduction explaining what to look for
- Section on key features to consider (use ## for H2)
- Product recommendations (3-5 products) with:
  - Product name and brief description
  - Key specifications
  - Pros and cons
  - Price range
  - Best for (which type of user)
- Include budget, mid-range, and premium options
- Comparison table of top picks
- Conclusion with final recommendations
- Use proper markdown formatting

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
}
