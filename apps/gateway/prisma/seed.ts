import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      emailConfirmed: true, // Подтверждаем email для тестового пользователя
    },
  });

  // Create test photos (individual creates for PostgreSQL)
  const photo1 = await prisma.photo.upsert({
    where: { id: 'sunset-photo' },
    update: {},
    create: {
      id: 'sunset-photo',
      title: 'Beautiful Sunset',
      description:
        'A stunning sunset over the mountains with golden rays illuminating the peaks and creating a breathtaking view that takes your breath away',
      url: 'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?w=1200',
      tags: 'nature,sunset,mountains',
      userId: user.id,
    },
  });

  const photo2 = await prisma.photo.upsert({
    where: { id: 'city-photo' },
    update: {},
    create: {
      id: 'city-photo',
      title: 'City Lights',
      description:
        'Urban night photography capturing the vibrant city lights and busy streets filled with people and cars moving through the night',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
      tags: 'urban,night,city',
      userId: user.id,
    },
  });

  // Добавляем еще несколько тестовых пользователей
  const user2 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      username: 'john_doe',
      email: 'john@example.com',
      password: hashedPassword,
      emailConfirmed: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: hashedPassword,
      emailConfirmed: true,
    },
  });

  // Создаем профили для пользователей
  const profile1 = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      username: user.username,
      firstName: 'Test',
      lastName: 'User',
      city: 'Moscow',
      country: 'Russia',
      aboutMe: 'Test user profile',
      avatarUrl: [],
    },
  });

  const profile2 = await prisma.profile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      username: user2.username,
      firstName: 'John',
      lastName: 'Doe',
      city: 'New York',
      country: 'USA',
      aboutMe: 'Photography enthusiast',
      avatarUrl: [],
    },
  });

  const profile3 = await prisma.profile.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      username: user3.username,
      firstName: 'Jane',
      lastName: 'Smith',
      city: 'London',
      country: 'UK',
      aboutMe: 'Nature photographer',
      avatarUrl: [],
    },
  });

  // Добавляем фото для новых пользователей
  const photo3 = await prisma.photo.upsert({
    where: { id: 'portrait-photo' },
    update: {},
    create: {
      id: 'portrait-photo',
      title: 'Portrait Photography',
      description:
        'Professional portrait session with carefully arranged lighting and composition that highlights the subject personality and creates an artistic atmosphere',
      url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1200',
      tags: 'portrait,professional,photography',
      userId: user2.id,
    },
  });

  const photo4 = await prisma.photo.upsert({
    where: { id: 'landscape-photo' },
    update: {},
    create: {
      id: 'landscape-photo',
      title: 'Mountain Landscape',
      description:
        'Breathtaking mountain views with snow-capped peaks and valleys filled with lush greenery that create a perfect landscape photography opportunity',
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
      tags: 'landscape,mountains,nature',
      userId: user3.id,
    },
  });

  // Добавим ещё 8 постов (итого 12)
  const extra = [
    {
      id: 'forest-photo',
      title: 'Deep Forest',
      description:
        'Misty morning in the forest with dew-covered leaves and sunlight filtering through the canopy creating a magical and serene atmosphere',
      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200',
      tags: 'nature,forest,morning',
      userId: user.id,
    },
    {
      id: 'sea-photo',
      title: 'Sea Waves',
      description:
        'Blue waves on the shore crashing against the rocks with white foam and sea spray creating a dynamic and powerful natural scene',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
      tags: 'sea,water,waves',
      userId: user2.id,
    },
    {
      id: 'desert-photo',
      title: 'Desert Dunes',
      description:
        'Golden sand dunes at sunset with warm orange and red hues painting the sky and casting long shadows across the desert landscape',
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
      tags: 'desert,sand,sunset',
      userId: user3.id,
    },
    {
      id: 'bridge-photo',
      title: 'City Bridge',
      description:
        'Bridge over the river at night with beautiful lights reflecting on the water surface creating a magical atmosphere that captivates everyone who sees it zxcvbnmasdfgh',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
      tags: 'city,bridge,night',
      userId: user.id,
    },
    {
      id: 'mountain-lake-photo',
      title: 'Mountain Lake',
      description:
        'Crystal clear lake in the mountains surrounded by pine trees and rocky cliffs reflecting the blue sky and creating a peaceful natural paradise',
      url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
      tags: 'mountains,lake,clear',
      userId: user2.id,
    },
    {
      id: 'field-flowers-photo',
      title: 'Field of Flowers',
      description:
        'Colorful flowers in the field blooming in spring with various shades of red, yellow, and purple creating a vibrant and cheerful meadow scene',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
      tags: 'field,flowers,colorful',
      userId: user3.id,
    },
    {
      id: 'night-sky-photo',
      title: 'Night Sky',
      description:
        'Milky Way over the mountains visible in the night sky with thousands of stars forming a bright galactic band across the heavens',
      url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200',
      tags: 'night,sky,milkyway',
      userId: user.id,
    },
    {
      id: 'forest-path-photo',
      title: 'Forest Path',
      description:
        'Small path through the dense forest winding between tall trees and bushes leading to a hidden clearing in the woods',
      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200',
      tags: 'forest,path,trees',
      userId: user2.id,
    },
  ];

  for (const p of extra) {
    await prisma.photo.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log('Seed completed successfully');
  console.log('Created users:', user.username, user2.username, user3.username);
  console.log(
    'Created photos:',
    photo1.title,
    photo2.title,
    photo3.title,
    photo4.title,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
