/*
  Warnings:

  - The `currency` column on the `business_config` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('ARS', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "business_config" ADD COLUMN     "businessDescription" TEXT,
DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyCode" NOT NULL DEFAULT 'ARS';
