import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const posts = await prisma.post.findMany({
        where: {
            status: { in: ['IN_REVIEW', 'DRAFT'] }
        },
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            status: true,
            contentType: true,
            createdAt: true,
            categories: {
                select: { name: true, slug: true }
            },
            tags: {
                select: { name: true }
            }
        }
    });

    for (const post of posts) {
        console.log('\n' + '='.repeat(80));
        console.log('ARTICLE:', post.title);
        console.log('='.repeat(80));
        console.log('Status:', post.status);
        console.log('Type:', post.contentType);
        console.log('Categories:', post.categories.map(c => c.name).join(', '));
        console.log('Tags:', post.tags.map(t => t.name).join(', '));
        console.log('\nEXCERPT:', post.excerpt);
        console.log('\nFULL CONTENT:');
        console.log('-'.repeat(40));
        console.log(post.content);
        console.log('-'.repeat(40));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
