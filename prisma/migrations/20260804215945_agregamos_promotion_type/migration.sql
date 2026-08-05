-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'TWO_FOR_ONE', 'FIXED', 'FEATURED');

-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "discountValue" DECIMAL(10,2),
ADD COLUMN     "type" "PromotionType" NOT NULL DEFAULT 'FEATURED';
