-- CreateEnum
CREATE TYPE "PostStatusType" AS ENUM ('private', 'public');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatusType" NOT NULL DEFAULT 'public';
