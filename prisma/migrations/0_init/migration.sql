-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT', 'FINANCIER', 'EDITEUR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT,
    "type" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salle" (
    "id" TEXT NOT NULL,
    "nom_salle" TEXT NOT NULL,
    "nombre_place" INTEGER,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,

    CONSTRAINT "Salle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commodite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Commodite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalleCommodite" (
    "salleId" TEXT NOT NULL,
    "commoditeId" INTEGER NOT NULL,

    CONSTRAINT "SalleCommodite_pkey" PRIMARY KEY ("salleId","commoditeId")
);

-- CreateTable
CREATE TABLE "Even" (
    "id" TEXT NOT NULL,
    "nom_evenement" TEXT,
    "categorie" TEXT NOT NULL,
    "montant" DOUBLE PRECISION,
    "avance" DOUBLE PRECISION,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "nom_client" TEXT,
    "contact_client" TEXT,
    "type" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "fiche" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salle_id" TEXT,
    "agent_id" TEXT,

    CONSTRAINT "Even_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notif" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "Notif_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalleCommodite" ADD CONSTRAINT "SalleCommodite_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "Salle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalleCommodite" ADD CONSTRAINT "SalleCommodite_commoditeId_fkey" FOREIGN KEY ("commoditeId") REFERENCES "Commodite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "Salle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notif" ADD CONSTRAINT "Notif_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

