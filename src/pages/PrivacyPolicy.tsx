import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Privacy Policy | Yowa Innovations" description="Learn how Yowa Innovations collects, uses, and protects your personal information." />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 text-center">Privacy Policy</h1>
          <p className="text-center text-muted-foreground mb-12">Last updated: February 7, 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Yowa Innovations Ltd ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website at yowainnovations.com (the "Site") or engage our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Personal information you provide:</strong> Name, email address, phone number, company name, and any other information you submit through our contact forms, lead generation forms, or newsletter sign-up.</li>
                <li><strong>Automatically collected information:</strong> IP address, browser type, device information, operating system, referring URLs, pages visited, time spent on the Site, and other usage data collected through cookies and similar technologies.</li>
                <li><strong>Service-related information:</strong> Project details, budget information, geographic location, and industry type provided when you enquire about our services.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Respond to your enquiries and provide our services</li>
                <li>Send you newsletters, marketing communications, and service updates (with your consent)</li>
                <li>Improve our website, services, and user experience</li>
                <li>Analyse website traffic and usage patterns</li>
                <li>Comply with legal obligations and protect our rights</li>
                <li>Prevent fraud and ensure the security of our Site</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">4. Legal Basis for Processing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We process your personal data on the following legal bases:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Consent:</strong> Where you have given us explicit consent to process your data (e.g., newsletter subscriptions, marketing communications).</li>
                <li><strong>Contractual necessity:</strong> Where processing is necessary to perform a contract with you or to take steps at your request before entering into a contract.</li>
                <li><strong>Legitimate interest:</strong> Where processing is necessary for our legitimate business interests, such as improving our services, provided your rights do not override those interests.</li>
                <li><strong>Legal obligation:</strong> Where processing is necessary to comply with applicable laws and regulations.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">5. Sharing of Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Service providers:</strong> Third-party vendors who assist us in operating our website, conducting our business, or serving our users (e.g., hosting providers, analytics services, email marketing platforms).</li>
                <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process, or to protect our rights, property, or safety.</li>
                <li><strong>Business transfers:</strong> In connection with any merger, acquisition, or sale of assets.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to fulfil the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. When your data is no longer needed, we will securely delete or anonymise it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Depending on your location and applicable law, you may have the following rights:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data in certain circumstances.</li>
                <li><strong>Restriction:</strong> Request that we restrict the processing of your data.</li>
                <li><strong>Data portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> Object to our processing of your data for certain purposes.</li>
                <li><strong>Withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, please contact us using the details provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">8. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">9. International Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than Uganda. Where such transfers occur, we take appropriate measures to ensure your data is protected in accordance with applicable data protection laws, including the Uganda Data Protection and Privacy Act, 2019.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Site is not directed at children under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page indicates when it was most recently revised. We encourage you to review this page periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display font-semibold text-2xl mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us at:
              </p>
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-muted-foreground"><strong>Yowa Innovations Ltd</strong></p>
                <p className="text-muted-foreground">Kampala, Uganda</p>
                <p className="text-muted-foreground">Email: info@yowainnovations.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
