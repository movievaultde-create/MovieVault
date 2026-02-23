import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum — MovieVault",
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pt-24 pb-16">
      <h1 className="mb-8 text-3xl font-bold text-white">Impressum</h1>

      <div className="space-y-6 text-sm leading-relaxed text-gray-400">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Angaben gemäß § 5 TMG</h2>
          <p>
            MovieVault<br />
            Online-Streaming-Plattform<br />
            Betrieben als privates Projekt
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Kontakt</h2>
          <p>
            E-Mail: contact [at] movievault [dot] app<br />
            Webseite: https://movie-vault-eosin.vercel.app
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Haftungsausschluss (Disclaimer)</h2>
          <h3 className="mb-1 font-medium text-gray-300">Haftung für Inhalte</h3>
          <p>
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-medium text-gray-300">Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
            mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
            Verlinkung nicht erkennbar.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-medium text-gray-300">Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-sm text-primary transition-colors hover:text-primary-hover">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
