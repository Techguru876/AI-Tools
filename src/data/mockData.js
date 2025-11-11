/**
 * Mock Data for ReadKidz Application
 * Contains sample books, testimonials, gallery items, and feature data
 */

export const sampleBooks = [
  {
    id: 1,
    title: "The Magic Forest Adventure",
    author: "Emily & Max (Age 7)",
    age: "5-8",
    genre: "Fantasy",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
    description: "A young explorer discovers a hidden forest filled with talking animals and magical creatures.",
    pages: 12,
    createdDate: "2024-11-05"
  },
  {
    id: 2,
    title: "Rocket to the Moon",
    author: "Sarah & Dad (Age 6)",
    age: "4-7",
    genre: "Science Fiction",
    cover: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop",
    description: "Join Luna as she builds a rocket ship and travels to meet friendly moon creatures.",
    pages: 10,
    createdDate: "2024-11-08"
  },
  {
    id: 3,
    title: "The Brave Little Dragon",
    author: "Mia (Age 8)",
    age: "6-9",
    genre: "Adventure",
    cover: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=400&h=600&fit=crop",
    description: "A small dragon learns that bravery comes in all sizes when he saves his village.",
    pages: 15,
    createdDate: "2024-11-01"
  },
  {
    id: 4,
    title: "Princess of the Ocean",
    author: "Olivia & Mom (Age 5)",
    age: "4-6",
    genre: "Fantasy",
    cover: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop",
    description: "Dive underwater with Princess Coral as she makes friends with dolphins and sea turtles.",
    pages: 8,
    createdDate: "2024-10-28"
  },
  {
    id: 5,
    title: "Detective Dinosaur",
    author: "Jack (Age 9)",
    age: "7-10",
    genre: "Mystery",
    cover: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=600&fit=crop",
    description: "Rex the detective dinosaur solves the mystery of the missing prehistoric pizza!",
    pages: 18,
    createdDate: "2024-10-25"
  },
  {
    id: 6,
    title: "The Rainbow Garden",
    author: "Sophia & Teacher (Age 6)",
    age: "5-8",
    genre: "Educational",
    cover: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=600&fit=crop",
    description: "Learn about colors and nature as Lily plants a magical rainbow garden.",
    pages: 12,
    createdDate: "2024-10-20"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Jennifer Martinez",
    role: "Parent",
    avatar: "https://i.pravatar.cc/150?img=1",
    quote: "ReadKidz transformed bedtime stories! My daughter loves seeing herself as the hero in her own adventures. The AI-generated illustrations are absolutely magical.",
    rating: 5,
    location: "Austin, TX"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Elementary Teacher",
    avatar: "https://i.pravatar.cc/150?img=13",
    quote: "As a teacher, this tool is invaluable. I create personalized stories for my students that align with our curriculum. The engagement levels have skyrocketed!",
    rating: 5,
    location: "San Francisco, CA"
  },
  {
    id: 3,
    name: "Sarah Thompson",
    role: "Parent of 3",
    avatar: "https://i.pravatar.cc/150?img=5",
    quote: "Creating custom books for each of my kids based on their interests has been a game-changer. The video feature is perfect for sharing with grandparents!",
    rating: 5,
    location: "Portland, OR"
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "School Librarian",
    avatar: "https://i.pravatar.cc/150?img=12",
    quote: "ReadKidz encourages creativity and literacy in ways I've never seen before. Students are excited to write and illustrate their own stories.",
    rating: 5,
    location: "Chicago, IL"
  },
  {
    id: 5,
    name: "Emily Watson",
    role: "Parent & Author",
    avatar: "https://i.pravatar.cc/150?img=9",
    quote: "The quality of the AI-generated content is impressive. It's like having a professional illustrator and editor at your fingertips. My kids create new stories weekly!",
    rating: 5,
    location: "Seattle, WA"
  },
  {
    id: 6,
    name: "Robert Kim",
    role: "Special Ed Teacher",
    avatar: "https://i.pravatar.cc/150?img=14",
    quote: "The accessibility features make this perfect for students with diverse learning needs. The text-to-speech and customizable fonts are fantastic.",
    rating: 5,
    location: "Boston, MA"
  }
];

export const galleryItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
    title: "Fantasy Castle",
    description: "AI-generated castle scene",
    style: "Watercolor"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=600&fit=crop",
    title: "Space Adventure",
    description: "Cosmic exploration scene",
    style: "Digital Art"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1551715006-c0a0c42c9f49?w=800&h=600&fit=crop",
    title: "Jungle Explorer",
    description: "Wildlife adventure",
    style: "Cartoon"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1516380549878-d4952921e05e?w=800&h=600&fit=crop",
    title: "Ocean Wonders",
    description: "Underwater scene",
    style: "Realistic"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&h=600&fit=crop",
    title: "Mountain Quest",
    description: "Adventure in the peaks",
    style: "Oil Painting"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&h=600&fit=crop",
    title: "Enchanted Garden",
    description: "Magical flower garden",
    style: "Impressionist"
  }
];

export const features = [
  {
    id: 1,
    icon: "✍️",
    title: "AI Story Generation",
    description: "Create unique stories with our advanced AI. Choose genre, age range, and themes to generate personalized narratives.",
    color: "#FF6B9D"
  },
  {
    id: 2,
    icon: "🎨",
    title: "Custom Illustrations",
    description: "Transform your story into visual magic. Select art styles and generate beautiful illustrations for every page.",
    color: "#4ECDC4"
  },
  {
    id: 3,
    icon: "🎬",
    title: "Video Creation",
    description: "Turn stories into animated videos with AI narration and dubbing in multiple languages.",
    color: "#FFD93D"
  },
  {
    id: 4,
    icon: "📚",
    title: "Easy Publishing",
    description: "Export to PDF, ePub, or MP4. Share directly or publish to Amazon, Apple Books, and more.",
    color: "#95E1D3"
  },
  {
    id: 5,
    icon: "🌍",
    title: "Multi-Language Support",
    description: "Create stories in over 50 languages. Perfect for bilingual families and language learning.",
    color: "#F38181"
  },
  {
    id: 6,
    icon: "♿",
    title: "Accessibility First",
    description: "Built with accessibility in mind. Screen reader compatible, high contrast modes, and text-to-speech.",
    color: "#AA96DA"
  }
];

export const artStyles = [
  { id: 1, name: "Watercolor", preview: "🎨" },
  { id: 2, name: "Cartoon", preview: "🖍️" },
  { id: 3, name: "Realistic", preview: "🖼️" },
  { id: 4, name: "Oil Painting", preview: "🎭" },
  { id: 5, name: "Digital Art", preview: "💻" },
  { id: 6, name: "Impressionist", preview: "🌸" },
  { id: 7, name: "Comic Book", preview: "💥" },
  { id: 8, name: "Anime", preview: "✨" }
];

export const genres = [
  { id: 1, name: "Fantasy", emoji: "🧙‍♂️" },
  { id: 2, name: "Adventure", emoji: "🗺️" },
  { id: 3, name: "Science Fiction", emoji: "🚀" },
  { id: 4, name: "Mystery", emoji: "🔍" },
  { id: 5, name: "Educational", emoji: "📖" },
  { id: 6, name: "Animals", emoji: "🦁" },
  { id: 7, name: "Fairy Tales", emoji: "👑" },
  { id: 8, name: "Friendship", emoji: "🤝" }
];

export const ageRanges = [
  { id: 1, range: "0-3", label: "Toddlers" },
  { id: 2, range: "4-6", label: "Preschool" },
  { id: 3, range: "5-8", label: "Early Readers" },
  { id: 4, range: "7-10", label: "Middle Grade" },
  { id: 5, range: "9-12", label: "Tweens" }
];
