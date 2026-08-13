/*
  Warnings:

  - You are about to drop the column `heroImageUrl` on the `business_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "business_config" DROP COLUMN "heroImageUrl";

-- CreateTable
CREATE TABLE "hero_images" (
    "id" TEXT NOT NULL,
    "businessConfigId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hero_images" ADD CONSTRAINT "hero_images_businessConfigId_fkey" FOREIGN KEY ("businessConfigId") REFERENCES "business_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
