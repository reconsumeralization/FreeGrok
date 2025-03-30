import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using our B2B networking platform",
}

export default function TermsOfServicePage() {
  return (
    <div>
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: March 29, 2025</p>

      <section className="mt-8">
        <h2>1. Introduction</h2>
        <p>
          Welcome to our B2B Social Networking Platform. These Terms of Service ("Terms") govern your access to and use
          of our platform, including any content, functionality, and services offered on or through our platform.
        </p>
        <p>
          By registering with us or by using our platform, you accept and agree to be bound by these Terms. If you do
          not agree to these Terms, you must not access or use our platform.
        </p>
      </section>

      <section className="mt-6">
        <h2>2. Definitions</h2>
        <p>In these Terms:</p>
        <ul>
          <li>
            <strong>"Platform"</strong> refers to our B2B Social Networking Platform, accessible via our website and
            mobile applications
          </li>
          <li>
            <strong>"User"</strong> refers to any individual or entity that accesses or uses the Platform
          </li>
          <li>
            <strong>"Content"</strong> refers to any information, data, text, graphics, images, videos, or other
            materials that Users upload, post, or otherwise make available on the Platform
          </li>
          <li>
            <strong>"We," "Us," "Our"</strong> refers to the company operating the Platform
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>3. Account Registration</h2>
        <p>
          To access certain features of the Platform, you must register for an account. When you register, you agree to
          provide accurate, current, and complete information about yourself.
        </p>
        <p>
          You are responsible for safeguarding your account credentials and for all activities that occur under your
          account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
        <p>
          We reserve the right to disable any user account at any time if, in our opinion, you have failed to comply
          with these Terms or if we suspect fraudulent or abusive activity.
        </p>
      </section>

      <section className="mt-6">
        <h2>4. Acceptable Use</h2>
        <p>
          You agree to use the Platform only for lawful purposes and in accordance with these Terms. Specifically, you
          agree not to:
        </p>
        <ul>
          <li>Use the Platform in any way that violates any applicable law or regulation</li>
          <li>
            Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person
            or entity
          </li>
          <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Platform</li>
          <li>Use the Platform to send unsolicited promotional or advertising material</li>
          <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Platform</li>
          <li>
            Use the Platform to transmit any material that contains viruses, trojan horses, or other harmful components
          </li>
          <li>Collect or harvest any information or data from the Platform or our systems</li>
          <li>Post or transmit any content that is illegal, fraudulent, or violates the rights of others</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>5. User Content</h2>
        <p>
          You retain ownership of any Content you post on the Platform. By posting Content, you grant us a worldwide,
          non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your
          Content in connection with the operation and provision of the Platform.
        </p>
        <p>You represent and warrant that:</p>
        <ul>
          <li>You own or have the necessary rights to the Content you post</li>
          <li>
            Your Content does not violate the privacy rights, publicity rights, copyright, contractual rights, or any
            other rights of any person or entity
          </li>
          <li>
            Your Content does not contain any material that is defamatory, obscene, indecent, abusive, offensive,
            harassing, violent, hateful, inflammatory, or otherwise objectionable
          </li>
        </ul>
        <p>
          We reserve the right to remove any Content that violates these Terms or that we determine is harmful,
          offensive, or otherwise inappropriate.
        </p>
      </section>

      <section className="mt-6">
        <h2>6. Intellectual Property Rights</h2>
        <p>
          The Platform and its entire contents, features, and functionality (including but not limited to all
          information, software, text, displays, images, video, and audio) are owned by us, our licensors, or other
          providers of such material and are protected by copyright, trademark, patent, trade secret, and other
          intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform,
          republish, download, store, or transmit any of the material on our Platform, except as follows:
        </p>
        <ul>
          <li>
            Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing
            those materials
          </li>
          <li>
            You may store files that are automatically cached by your Web browser for display enhancement purposes
          </li>
          <li>
            You may print or download one copy of a reasonable number of pages of the Platform for your own personal,
            non-commercial use and not for further reproduction, publication, or distribution
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2>7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages, including but not limited to, damages for loss of profits,
          goodwill, use, data, or other intangible losses, resulting from:
        </p>
        <ul>
          <li>Your access to or use of or inability to access or use the Platform</li>
          <li>Any conduct or content of any third party on the Platform</li>
          <li>Any content obtained from the Platform</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>
        <p>
          Our liability to you for any cause whatsoever and regardless of the form of the action, will at all times be
          limited to the amount paid, if any, by you to us for the Platform during the term of your use of the Platform.
        </p>
      </section>

      <section className="mt-6">
        <h2>8. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold us harmless from and against any claims, liabilities, damages,
          judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or
          relating to your violation of these Terms or your use of the Platform.
        </p>
      </section>

      <section className="mt-6">
        <h2>9. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or
          liability, for any reason whatsoever, including without limitation if you breach these Terms.
        </p>
        <p>
          Upon termination, your right to use the Platform will immediately cease. If you wish to terminate your
          account, you may simply discontinue using the Platform or contact us to request account deletion.
        </p>
      </section>

      <section className="mt-6">
        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without
          regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mt-6">
        <h2>11. Dispute Resolution</h2>
        <p>
          Any dispute arising out of or relating to these Terms, including their formation, interpretation, breach, or
          termination, shall be resolved through a two-step dispute resolution process:
        </p>
        <ol>
          <li>
            <strong>Informal Negotiation</strong>: The parties shall first attempt to resolve any dispute through
            informal negotiation. The complaining party shall notify the other party in writing of the dispute. The
            recipient shall have 30 days to respond and 30 days to resolve the dispute.
          </li>
          <li>
            <strong>Arbitration</strong>: If the dispute is not resolved through informal negotiation, it shall be
            settled by binding arbitration conducted by a single arbitrator in accordance with the rules of [Arbitration
            Association] in [Arbitration Location].
          </li>
        </ol>
      </section>

      <section className="mt-6">
        <h2>12. Changes to Terms</h2>
        <p>
          We may revise these Terms at any time by updating this page. By continuing to access or use our Platform after
          those revisions become effective, you agree to be bound by the revised Terms.
        </p>
      </section>

      <section className="mt-6">
        <h2>13. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>
          Email: legal@yourplatform.com
          <br />
          Address: 123 Business Street, Tech City, TC 12345
        </p>
      </section>
    </div>
  )
}

