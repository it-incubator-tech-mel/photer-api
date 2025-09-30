import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './apps/gateway/prisma/schema.prisma',
  out: './node_modules/.prisma',
  client: {
    output: './node_modules/@prisma/client',
  },
});
