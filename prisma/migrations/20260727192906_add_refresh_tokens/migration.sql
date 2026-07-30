/*
  Warnings:

  - You are about to drop the column `replacedByTokenId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `token` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."refresh_tokens_tokenHash_key";

-- DropIndex
DROP INDEX "public"."refresh_tokens_userId_idx";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "replacedByTokenId",
DROP COLUMN "revokedAt",
DROP COLUMN "tokenHash",
ADD COLUMN     "token" TEXT NOT NULL;
