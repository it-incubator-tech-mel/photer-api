const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePost() {
  try {
    const updated = await prisma.photo.update({
      where: { id: 'forest-path-photo' },
      data: {
        url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200,https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200,https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
      },
    });
    console.log('Post updated:', updated.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePost();
