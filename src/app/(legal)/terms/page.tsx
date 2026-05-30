export default function TermsPage() {
  return (
    <article className="prose-legal">
      <h1>Terms of Service</h1>
      <p className="text-text-tertiary text-[13px]">Last updated: May 30, 2026</p>

      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using TradeVault (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
        If you do not agree to these terms, do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        TradeVault is a financial management platform designed for funded traders to track accounts,
        payouts, expenses, and portfolio performance. TradeVault is not a broker, trading platform,
        investment advisor, or financial institution. We do not execute trades, custody assets, or
        provide financial advice.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        You must provide accurate, current, and complete information during registration. You are
        responsible for maintaining the confidentiality of your account credentials and for all
        activities under your account.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose</li>
        <li>Attempt to gain unauthorized access to the Service or its systems</li>
        <li>Interfere with or disrupt the Service infrastructure</li>
        <li>Upload malicious code or attempt to exploit vulnerabilities</li>
        <li>Resell, redistribute, or sublicense access to the Service</li>
      </ul>

      <h2>5. Subscription &amp; Billing</h2>
      <p>
        TradeVault offers free and paid plans. Paid subscriptions are billed through Stripe.
        By subscribing, you authorize recurring charges. You may cancel at any time; access
        continues until the end of the billing period. Refunds are not provided for partial periods.
      </p>

      <h2>6. Data Accuracy</h2>
      <p>
        TradeVault displays financial data based on information you input. We do not guarantee the
        accuracy of calculations, projections, or insights. You are solely responsible for verifying
        all financial data. Do not rely on TradeVault as your sole source of financial truth.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service, including its design, code, branding, and content, is owned by TradeVault.
        You retain ownership of all data you input into the Service.
      </p>

      <h2>8. Data &amp; Privacy</h2>
      <p>
        Your use of TradeVault is also governed by our <a href="/privacy">Privacy Policy</a>.
        We take the security of your financial data seriously and implement industry-standard measures.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        TradeVault is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
        indirect, incidental, or consequential damages arising from your use of the Service,
        including but not limited to financial losses, data loss, or business interruption.
      </p>

      <h2>10. Disclaimer</h2>
      <p>
        TradeVault does not provide tax, legal, or investment advice. Financial insights and
        analytics are for informational purposes only. Consult a qualified professional for
        tax filings and financial decisions.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may suspend or terminate your account if you violate these terms. You may delete
        your account at any time from Settings. Upon termination, your data will be permanently
        deleted within 30 days.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may update these terms at any time. Continued use of the Service after changes
        constitutes acceptance. We will notify registered users of material changes via email.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These terms are governed by and construed in accordance with applicable law in the
        jurisdiction where TradeVault operates.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these terms, contact us at{" "}
        <a href="mailto:legal@tradevault.app">legal@tradevault.app</a>.
      </p>
    </article>
  );
}
