import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our commitment to protecting your privacy and data",
}

export default function PrivacyPolicyPage() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: March 29, 2025</p>

      <section className="mt-8">
        <h2>1. Introduction</h2>
        <p>
          Welcome to our B2B Social Networking Platform. We respect your privacy and are committed to protecting your
          personal data. This privacy policy will inform you about how we look after your personal data when you visit
          our platform and tell you about your privacy rights and how the law protects you.
        </p>
      </section>

      <section className="mt-6">
        <h2>2. Data We Collect</h2>
        <p>We collect and process the following categories of personal data:</p>
        <ul>
          <li>
            <strong>Identity Data</strong>: includes first name, last name, username, title, and profile picture
          </li>
          <li>
            <strong>Contact Data</strong>: includes email address, business address, and phone numbers
          </li>
          <li>
            <strong>Professional Data</strong>: includes employment history, education, skills, and professional
            certifications
          </li>
          <li>
            <strong>Technical Data</strong>: includes internet protocol (IP) address, browser type and version, time
            zone setting, browser plug-in types and versions, operating system and platform
          </li>
          <li>
            <strong>Usage Data</strong>: includes information about how you use our platform, such as pages visited,
            features used, and content interactions
          </li>
          <li>
            <strong>Connection Data</strong>: includes information about your network, connections, and interactions
            with other users
          </li>
          <li>
            <strong>Content Data</strong>: includes information you post, share, or create on our platform
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>3. How We Use Your Data</h2>
        <p>We use your personal data for the following purposes:</p>
        <ul>
          <li>To create and manage your account</li>
          <li>To provide and personalize our services</li>
          <li>To connect you with relevant professional opportunities and contacts</li>
          <li>To improve and develop our platform</li>
          <li>To communicate with you about our services, updates, and relevant content</li>
          <li>To ensure the security and integrity of our platform</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>4. Data Sharing</h2>
        <p>We may share your personal data with the following categories of recipients:</p>
        <ul>
          <li>
            <strong>Other Users</strong>: Information you provide in your profile and content you post may be visible to
            other users based on your privacy settings
          </li>
          <li>
            <strong>Service Providers</strong>: We share data with third-party service providers who perform services on
            our behalf, such as hosting, analytics, and customer support
          </li>
          <li>
            <strong>Business Partners</strong>: With your consent, we may share data with business partners to offer you
            relevant opportunities
          </li>
          <li>
            <strong>Legal Authorities</strong>: We may disclose data in response to legal requests or to comply with
            applicable laws
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>5. Your Rights</h2>
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul>
          <li>
            <strong>Access</strong>: You can request a copy of the personal data we hold about you
          </li>
          <li>
            <strong>Rectification</strong>: You can request that we correct inaccurate or incomplete data
          </li>
          <li>
            <strong>Erasure</strong>: You can request that we delete your personal data in certain circumstances
          </li>
          <li>
            <strong>Restriction</strong>: You can request that we restrict the processing of your data in certain
            circumstances
          </li>
          <li>
            <strong>Data Portability</strong>: You can request to receive your data in a structured, commonly used
            format
          </li>
          <li>
            <strong>Objection</strong>: You can object to our processing of your data in certain circumstances
          </li>
        </ul>
        <p>To exercise these rights, please contact us using the details provided in the "Contact Us" section.</p>
      </section>

      <section className="mt-6">
        <h2>6. Data Security</h2>
        <p>
          We have implemented appropriate security measures to prevent your personal data from being accidentally lost,
          used, or accessed in an unauthorized way, altered, or disclosed. These measures include:
        </p>
        <ul>
          <li>Encryption of sensitive data</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication mechanisms</li>
          <li>Secure data storage and transmission</li>
          <li>Regular backups and disaster recovery procedures</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>7. Cookies and Similar Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our platform and to hold certain
          information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
        </p>
        <p>We use the following types of cookies:</p>
        <ul>
          <li>
            <strong>Essential Cookies</strong>: Necessary for the platform to function properly
          </li>
          <li>
            <strong>Analytical/Performance Cookies</strong>: Allow us to recognize and count the number of visitors and
            see how visitors move around our platform
          </li>
          <li>
            <strong>Functionality Cookies</strong>: Enable us to personalize content and remember your preferences
          </li>
          <li>
            <strong>Targeting Cookies</strong>: Record your visit to our platform, the pages you have visited, and the
            links you have followed
          </li>
        </ul>
        <p>
          You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access
          cookies.
        </p>
      </section>

      <section className="mt-6">
        <h2>8. International Transfers</h2>
        <p>
          We may transfer your personal data to countries outside your country of residence. When we do so, we ensure
          appropriate safeguards are in place to protect your data and to comply with applicable data protection laws.
        </p>
      </section>

      <section className="mt-6">
        <h2>9. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for,
          including for the purposes of satisfying any legal, accounting, or reporting requirements.
        </p>
      </section>

      <section className="mt-6">
        <h2>10. Children's Privacy</h2>
        <p>
          Our platform is not intended for children under 16 years of age. We do not knowingly collect personal data
          from children under 16. If you are a parent or guardian and believe your child has provided us with personal
          data, please contact us.
        </p>
      </section>

      <section className="mt-6">
        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update our privacy policy from time to time. We will notify you of any changes by posting the new
          privacy policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section className="mt-6">
        <h2>12. Contact Us</h2>
        <p>If you have any questions about this privacy policy or our data practices, please contact us at:</p>
        <p>
          Email: privacy@yourplatform.com
          <br />
          Address: 123 Business Street, Tech City, TC 12345
        </p>
      </section>

      <section className="mt-6">
        <h2>13. Regulatory Information</h2>
        <p>
          For users in the European Economic Area (EEA), the UK, or California, you have additional rights under the
          GDPR and CCPA. Our Data Protection Officer can be contacted at dpo@yourplatform.com.
        </p>
      </section>
    </div>
  )
}

