-- Add tutorials category
INSERT INTO "Category" (id, name, slug, description, color, "createdAt", "updatedAt")
VALUES (
  'cm0tutorials001',
  'Tutorials',
  'tutorials',
  'Step-by-step guides and how-to articles',
  '#10B981',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
