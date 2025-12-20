import Navbar from "./Navbar";
import Footer from "./Footer";
import "../globals.css"; // Assurez-vous d'importer vos styles globaux (Tailwind)


// Métadonnées SEO (Titre et description par défaut)
export const metadata = {
  title: "Centre Culturel Jacques Aka | Bouaké",
  description: "Le centre culturel de référence à Bouaké. Spectacles, concerts, théâtre et locations de salles.",
};

export default function WebLayout({ children }) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased scroll-smooth`}>

      {/* Navigation (Header) */}
      <Navbar />

      {/* Contenu principal (La page courante s'affichera ici) */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Pied de page (Footer) */}
      <Footer />

    </div>
  );
}