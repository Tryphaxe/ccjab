import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await authorize(request, ['ADMIN', 'FINANCIER']);
  if (auth.response) return auth.response;
  try {
    const events = await prisma.even.findMany({
      select: {
        date_debut: true,
      },
    });

    const uniqueMonths = new Map();

    events.forEach((event) => {
      if (event.date_debut) {
        const date = new Date(event.date_debut);
        const month = date.getMonth() + 1; 
        const year = date.getFullYear();
        
        const key = `${year}-${month}`; // Format: "2024-5"

        if (!uniqueMonths.has(key)) {
          const label = new Intl.DateTimeFormat('fr-FR', {
            month: 'long',
            year: 'numeric',
          }).format(date);

          uniqueMonths.set(key, {
            value: key,
            label: label.charAt(0).toUpperCase() + label.slice(1), // Ex: "Mai 2024"
          });
        }
      }
    });

    const availableMonths = Array.from(uniqueMonths.values());
    
    // Trier du plus récent au plus ancien
    availableMonths.sort((a, b) => {
      const [yearA, monthA] = a.value.split('-');
      const [yearB, monthB] = b.value.split('-');
      return new Date(yearB, monthB - 1) - new Date(yearA, monthA - 1);
    });

    return NextResponse.json(availableMonths, { status: 200 });
  } catch (error) {
    console.error("Erreur api/available-months:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les mois disponibles" },
      { status: 500 }
    );
  }
}
