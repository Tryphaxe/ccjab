/*
  Warnings:

  - You are about to drop the column `categorie_even_id` on the `Even` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Even` table. All the data in the column will be lost.
  - You are about to drop the column `type_even_id` on the `Even` table. All the data in the column will be lost.
  - You are about to drop the `CategorieEven` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeEven` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Even" DROP CONSTRAINT "Even_categorie_even_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Even" DROP CONSTRAINT "Even_type_even_id_fkey";

-- AlterTable
ALTER TABLE "Even" DROP COLUMN "categorie_even_id",
DROP COLUMN "statut",
DROP COLUMN "type_even_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "public"."CategorieEven";

-- DropTable
DROP TABLE "public"."TypeEven";
