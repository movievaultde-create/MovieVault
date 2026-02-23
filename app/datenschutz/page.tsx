import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — MovieVault",
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pt-24 pb-16">
      <h1 className="mb-8 text-3xl font-bold text-white">Datenschutzerklärung</h1>

      <div className="space-y-6 text-sm leading-relaxed text-gray-400">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">1. Datenschutz auf einen Blick</h2>
          <h3 className="mb-1 font-medium text-gray-300">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter
            diesem Text aufgeführten Datenschutzerklärung.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">2. Datenerfassung auf dieser Website</h2>
          <h3 className="mb-1 font-medium text-gray-300">Wer ist verantwortlich für die Datenerfassung?</h3>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.
            Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>

          <h3 className="mt-3 mb-1 font-medium text-gray-300">Wie erfassen wir Ihre Daten?</h3>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen.
            Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website
            durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser,
            Betriebssystem oder Uhrzeit des Seitenaufrufs).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">3. Hosting</h2>
          <p>
            Wir hosten die Inhalte unserer Website bei Vercel Inc. (340 S Lemon Ave #4133,
            Walnut, CA 91789, USA). Wenn Sie unsere Website besuchen, werden Ihre personenbezogenen
            Daten auf den Servern von Vercel verarbeitet. Es kann hierbei auch zu einer Übermittlung
            von personenbezogenen Daten an die Server von Vercel in die USA kommen.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">4. Allgemeine Hinweise und Pflichtinformationen</h2>
          <h3 className="mb-1 font-medium text-gray-300">Datenschutz</h3>
          <p>
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
            Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
            Datenschutzvorschriften sowie dieser Datenschutzerklärung.
          </p>
          <p className="mt-2">
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation
            per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem
            Zugriff durch Dritte ist nicht möglich.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">5. Cookies</h2>
          <p>
            Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem
            Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot
            nutzerfreundlicher, effektiver und sicherer zu machen. Cookies sind kleine Textdateien,
            die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert.
          </p>
          <p className="mt-2">
            Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert
            werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte
            Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim
            Schließen des Browsers aktivieren.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">6. Werbung / Drittanbieter</h2>
          <p>
            Diese Website nutzt Werbedienstleistungen von Drittanbietern. Diese Dienste können
            Cookies und ähnliche Tracking-Technologien verwenden, um Ihnen auf Ihre Interessen
            zugeschnittene Werbung anzuzeigen. Wir haben keinen Einfluss auf die Datenerhebung
            und -verarbeitung durch diese Drittanbieter.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">7. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
            Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem
            ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
            Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese jederzeit widerrufen.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-white">8. Analyse-Tools</h2>
          <p>
            Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden.
            Das geschieht vor allem mit Cookies und mit sogenannten Analyseprogrammen.
            Detaillierte Informationen zu diesen Analyseprogrammen finden Sie in der folgenden
            Datenschutzerklärung.
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
