import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  useEffect(() => { document.title = 'Privacy Policy — StreamVerse'; }, []);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-white/50 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>StreamVerse does not collect, store, or transmit any personal data to servers. The following information is stored locally in your browser using localStorage:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Watch progress and continue-watching markers</li>
              <li>Bookmarked/saved content (My List)</li>
              <li>Age verification status (timestamp only)</li>
              <li>Cookie consent preference</li>
              <li>Selected streaming provider preference</li>
            </ul>
            <p className="mt-2">This data never leaves your browser and is used solely to enhance your experience.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Third-Party Services</h2>
            <p>StreamVerse embeds content from third-party streaming providers. These providers may collect data according to their own privacy policies. We recommend reviewing their policies:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>TMDB API — Movie metadata provider</li>
              <li>VidKing / VidSrc — Embedded video streaming providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Cookies</h2>
            <p>StreamVerse does not use tracking cookies, analytics cookies, or advertising cookies. We only use browser localStorage (as described above), which is not accessible to third parties and does not transmit data to any server.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Data Security</h2>
            <p>Since all data is stored locally in your browser and never transmitted to our servers, there is no risk of server-side data breaches affecting your personal information. We recommend using a secure browser and keeping it updated.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Your Rights (GDPR / CCPA)</h2>
            <p>Under GDPR and CCPA, you have the right to know what data is collected and to delete it. Since all data is stored locally in your browser, you can clear it at any time by:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Clearing your browser's localStorage (Site Settings → Clear Data)</li>
              <li>Using private/incognito browsing mode</li>
              <li>Using the "Clear Local Storage" option in your browser's developer tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated effective date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Contact</h2>
            <p>If you have questions about this privacy policy, please reach out through our GitHub repository.</p>
          </section>
        </div>
      </motion.div>
    </>
  );
}
