import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DMCAPage() {
  useEffect(() => { document.title = 'DMCA Notice — StreamVerse'; }, []);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <h1 className="text-3xl font-bold text-white mb-8">DMCA Copyright Notice</h1>

        <div className="space-y-6 text-sm text-white/50 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Our Policy</h2>
            <p>
              StreamVerse respects the intellectual property rights of others and expects its users to do the same.
              In accordance with the Digital Millennium Copyright Act (DMCA), we will respond expeditiously to
              claims of copyright infringement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Important Notice</h2>
            <p>
              StreamVerse does not host, store, or upload any video content. All video content displayed on this
              platform is embedded from third-party streaming providers. We act as a search and aggregation service,
              linking to content hosted by external services.
            </p>
            <p className="mt-2">
              If you believe that your copyrighted work has been made available through our service without
              authorization, please contact the third-party provider where the content is actually hosted.
              The embedded content is served from the following providers:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>VidKing (vidking.net, vidking1.net, vidking2.net, vidking3.net)</li>
              <li>VidSrc (vidsrc-embed.ru, vidsrc-embed.su, vsrc.su)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Filing a DMCA Takedown Request</h2>
            <p>
              If you are unable to resolve the issue with the third-party provider and believe that StreamVerse
              must remove a link to allegedly infringing content, please provide the following information:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Your full name, address, telephone number, and email address.</li>
              <li>A description of the copyrighted work you claim has been infringed.</li>
              <li>The exact URL(s) on StreamVerse where the allegedly infringing content appears.</li>
              <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement, made under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on behalf of the owner.</li>
              <li>Your physical or electronic signature.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Designated Agent</h2>
            <p className="mb-2">
              DMCA takedown requests can be submitted to our designated agent:
            </p>
            <div className="glass rounded-xl p-4 space-y-1">
              <p><strong className="text-white/70">Email:</strong> dmca@streamverse.app</p>
              <p className="text-white/30 text-[11px]">(For demo purposes — replace with a real email in production)</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Counter-Notification</h2>
            <p>
              If you believe that content was removed or disabled as a result of mistake or misidentification,
              you may submit a counter-notification containing the same information as above, along with a
              statement of consent to the jurisdiction of the federal district court for your location.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Repeat Infringers</h2>
            <p>
              While StreamVerse does not host content directly, we reserve the right to disable access to our
              service for users who repeatedly engage in copyright-infringing activity, as defined by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h2>
            <p>
              StreamVerse acts as a passive intermediary and is entitled to the safe harbor protections
              under Section 512 of the DMCA. We do not control the content hosted by third-party providers
              and are not liable for copyright infringement by those providers.
            </p>
          </section>

          <p className="text-white/20 text-xs pt-4 border-t border-white/5">
            Last updated: {currentYear}. This is a template for demonstration purposes. Consult with a legal professional for compliance with your jurisdiction.
          </p>
        </div>
      </motion.div>
    </>
  );
}
