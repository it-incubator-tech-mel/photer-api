-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "providers" TEXT NOT NULL DEFAULT 'application';
