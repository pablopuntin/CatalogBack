-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "quotes" ALTER COLUMN "customerPhone" DROP NOT NULL;
