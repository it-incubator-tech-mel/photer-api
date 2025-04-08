-- CreateEnum
CREATE TYPE "PostStatusType" AS ENUM ('private', 'public');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(500),
    "photo" TEXT[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "PostStatusType" NOT NULL DEFAULT 'public',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
