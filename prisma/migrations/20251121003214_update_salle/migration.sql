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

-- AddForeignKey
ALTER TABLE "SalleCommodite" ADD CONSTRAINT "SalleCommodite_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "Salle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalleCommodite" ADD CONSTRAINT "SalleCommodite_commoditeId_fkey" FOREIGN KEY ("commoditeId") REFERENCES "Commodite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
