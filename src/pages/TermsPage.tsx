import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  useEffect(() => { document.title = 'Terms of Service — StreamVerse'; }, []);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="space-y-6 text-sm text-white/50 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using StreamVerse, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Service Description</h2>
            <p>StreamVerse is a content aggregation platform that provides links to third-party embedded video content. We do not host, store, or distribute any video files. All content is embedded from third-party streaming providers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years old to access mature content.</li>
              <li>You agree not to use the service for any unlawful purpose.</li>
              <li>You agree not to attempt to bypass any age verification or content restrictions.</li>
              <li>You are responsible for your internet connection and any data charges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Intellectual Property</h2>
            <p>All content displayed on StreamVerse is the property of their respective copyright holders. StreamVerse does not claim ownership of any third-party content. TMDB data is used in accordance with TMDB's terms of service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Third-Party Content</h2>
            <p>StreamVerse acts as an intermediary providing links to third-party streaming providers. We have no control over the content, availability, or quality of third-party streams. We strongly recommend that users only access content that is legally available in their jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Disclaimer of Warranties</h2>
            <p>StreamVerse is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Limitation of Liability</h2>
            <p>StreamVerse shall not be liable for any damages arising from the use or inability to use the service, including but not limited to direct, indirect, incidental, or consequential damages.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Contact</h2>
            <p>For questions about these terms, please contact us through our GitHub repository or reach out via the DMCA page for copyright concerns.</p>
          </section>
        </div>
      </motion.div>
    </>
  );
}
