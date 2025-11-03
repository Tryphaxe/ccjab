-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salle" (
    "id" TEXT NOT NULL,
    "nom_salle" TEXT NOT NULL,

    CONSTRAINT "Salle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeEven" (
    "id" TEXT NOT NULL,
    "nom_type" TEXT NOT NULL,

    CONSTRAINT "TypeEven_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorieEven" (
    "id" TEXT NOT NULL,
    "nom_categorie" TEXT NOT NULL,

    CONSTRAINT "CategorieEven_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Even" (
    "id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "montant" DOUBLE PRECISION,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'en attente',
    "nom_client" TEXT,
    "contact_client" TEXT,
    "salle_id" TEXT,
    "type_even_id" TEXT,
    "categorie_even_id" TEXT,
    "agent_id" TEXT,

    CONSTRAINT "Even_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notif" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "Notif_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "Salle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_type_even_id_fkey" FOREIGN KEY ("type_even_id") REFERENCES "TypeEven"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_categorie_even_id_fkey" FOREIGN KEY ("categorie_even_id") REFERENCES "CategorieEven"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Even" ADD CONSTRAINT "Even_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notif" ADD CONSTRAINT "Notif_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
