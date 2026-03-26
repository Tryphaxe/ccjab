/*
  Warnings:

  - You are about to drop the column `salle_id` on the `Even` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Even" DROP CONSTRAINT "Even_salle_id_fkey";

-- CreateTable
CREATE TABLE "_EvenToSalle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EvenToSalle_AB_pkey" PRIMARY KEY ("A","B")
);

-- Copie des 73 salles existantes vers la nouvelle table
INSERT INTO "_EvenToSalle" ("A", "B") SELECT id, salle_id FROM "Even" WHERE salle_id IS NOT NULL;

-- AlterTable
ALTER TABLE "Even" DROP COLUMN "salle_id";

-- CreateIndex
CREATE INDEX "_EvenToSalle_B_index" ON "_EvenToSalle"("B");

-- AddForeignKey
ALTER TABLE "_EvenToSalle" ADD CONSTRAINT "_EvenToSalle_A_fkey" FOREIGN KEY ("A") REFERENCES "Even"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EvenToSalle" ADD CONSTRAINT "_EvenToSalle_B_fkey" FOREIGN KEY ("B") REFERENCES "Salle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
