/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Agent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT');

-- DropForeignKey
ALTER TABLE "public"."Even" DROP CONSTRAINT "Even_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notif" DROP CONSTRAINT "Notif_agent_id_fkey";

-- DropTable
DROP TABLE "public"."Admin";

-- DropTable
DROP TABLE "public"."Agent";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notif" ADD CONSTRAINT "Notif_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
