import { Construction } from "lucide-react";

export default function BilletteriePage() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-12 text-center text-slate-900">
      <section className="max-w-lg rounded-2xl border border-orange-100 bg-white p-8 shadow-sm sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-orange-700">
          <Construction size={30} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Cette page est en construction</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          La billetterie du tableau de bord est temporairement indisponible. Elle sera accessible lorsqu’elle sera prête.
        </p>
      </section>
    </main>
  );
}
