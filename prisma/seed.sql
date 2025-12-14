-- TechFrontier Database Seed
-- Run with: psql -h localhost -U postgres -d techfronteir -f prisma/seed.sql

-- Insert Categories (ignore conflicts if they already exist)
INSERT INTO "Category" (id, name, slug, description, color, "createdAt", "updatedAt") VALUES
('cm4latech1', 'Tech', 'tech', 'Latest technology news, gadgets, and innovations', '#3B82F6', NOW(), NOW()),
('cm4lasci2', 'Science', 'science', 'Scientific discoveries and breakthroughs', '#10B981', NOW(), NOW()),
('cm4lacult3', 'Culture', 'culture', 'Entertainment, gaming, movies, and pop culture', '#8B5CF6', NOW(), NOW()),
('cm4larev4', 'Reviews', 'reviews', 'In-depth product reviews and comparisons', '#F59E0B', NOW(), NOW()),
('cm4ladeal5', 'Deals', 'deals', 'Best tech deals and shopping guides', '#EF4444', NOW(), NOW()),
('cm4laainew6', 'AI News', 'ai-news', 'Artificial intelligence and machine learning updates', '#06B6D4', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert Tags (ignore conflicts if they already exist)
INSERT INTO "Tag" (id, name, slug, "createdAt", "updatedAt") VALUES
('tag001', 'apple', 'apple', NOW(), NOW()),
('tag002', 'google', 'google', NOW(), NOW()),
('tag003', 'microsoft', 'microsoft', NOW(), NOW()),
('tag004', 'artificial intelligence', 'artificial-intelligence', NOW(), NOW()),
('tag005', 'machine learning', 'machine-learning', NOW(), NOW()),
('tag006', 'smartphones', 'smartphones', NOW(), NOW()),
('tag007', 'laptops', 'laptops', NOW(), NOW()),
('tag008', 'gaming', 'gaming', NOW(), NOW()),
('tag009', 'cybersecurity', 'cybersecurity', NOW(), NOW()),
('tag010', 'space', 'space', NOW(), NOW()),
('tag011', 'climate tech', 'climate-tech', NOW(), NOW()),
('tag012', 'electric vehicles', 'electric-vehicles', NOW(), NOW()),
('tag013', 'vr ar', 'vr-ar', NOW(), NOW()),
('tag014', 'blockchain', 'blockchain', NOW(), NOW()),
('tag015', 'quantum computing', 'quantum-computing', NOW(), NOW()),
('tag016', 'robotics', 'robotics', NOW(), NOW()),
('tag017', 'biotechnology', 'biotechnology', NOW(), NOW()),
('tag018', 'social media', 'social-media', NOW(), NOW()),
('tag019', 'cloud computing', 'cloud-computing', NOW(), NOW()),
('tag020', 'software', 'software', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Show results
SELECT 'Categories seeded:' AS result, COUNT(*) AS count FROM "Category"
UNION ALL
SELECT 'Tags seeded:' AS result, COUNT(*) AS count FROM "Tag";
