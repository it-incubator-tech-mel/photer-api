/*
  Warnings:

  - You are about to drop the column `exp` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `iat` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "exp",
DROP COLUMN "iat";

-- CreateTable
CREATE TABLE "RefreshToken" (
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "iat" INTEGER NOT NULL,
    "exp" INTEGER NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("userId")
);
