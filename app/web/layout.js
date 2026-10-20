import Navbar from "./Navbar";
import Footer from "./Footer";
import PublicPageMotion from "./PublicPageMotion";
import CursorFollow from "./CursorFollow";
import { Barlow_Condensed } from "next/font/google";
import "../globals.css"; // Assurez-vous d'importer vos styles globaux (Tailwind)

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-barlow-condensed",
});


// Métadonnées SEO (Titre et description par défaut)
export const metadata = {
  title: "Centre Culturel Jacques Aka | Bouaké",
  description: "Le centre culturel de référence à Bouaké. Spectacles, concerts, théâtre et locations de salles.",
};

export default function WebLayout({ children }) {
  return (
    <>
      <div className={`public-site ${barlowCondensed.variable}`}>
      <PublicPageMotion>

      {/* Navigation (Header) */}
      <Navbar />

      {/* Contenu principal (La page courante s'affichera ici) */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Pied de page (Footer) */}
      <Footer />
      </PublicPageMotion>
      <CursorFollow />
      </div>
    </>
  );
}
