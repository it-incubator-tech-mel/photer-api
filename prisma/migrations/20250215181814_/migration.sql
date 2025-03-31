-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lastActiveDate" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
