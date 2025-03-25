import { INestApplication } from '@nestjs/common';

export function corsSetup(app: INestApplication) {
  // app.enableCors({
  //   origin: (origin, callback) => {
  //     const allowedOrigins = ['https://photer.ltd'];
  //     if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/.+/.test(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   methods: '*',
  //   allowedHeaders: '*',
  //   credentials: true,
  // });

  app.enableCors({
    origin: ['http://localhost:3000', 'https://photer.ltd'],
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // app.enableCors({
  //   origin: '*',
  //   methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  //   allowedHeaders: 'Content-Type, Accept, Authorization',
  // });
}