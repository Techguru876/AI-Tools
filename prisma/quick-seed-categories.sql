-- Seed categories for TechFrontier
INSERT INTO "Category" (id, name, slug, description, color, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Tech', 'tech', 'Technology news and updates', '#3b82f6', NOW(), NOW()),
  (gen_random_uuid(), 'AI News', 'ai-news', 'Artificial Intelligence and Machine Learning', '#8b5cf6', NOW(), NOW()),
  (gen_random_uuid(), 'Reviews', 'reviews', 'Product reviews and comparisons', '#10b981', NOW(), NOW()),
  (gen_random_uuid(), 'Science', 'science', 'Scientific discoveries and research', '#06b6d4', NOW(), NOW()),
  (gen_random_uuid(), 'Culture', 'culture', 'Entertainment and cultural trends', '#f59e0b', NOW(), NOW()),
  (gen_random_uuid(), 'Deals', 'deals', 'Best tech deals and discounts', '#ef4444', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify
SELECT name, slug FROM "Category";
