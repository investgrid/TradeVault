export default function PrivacyPage() {
  return (
    <article className="prose-legal">
      <h1>Privacy Policy</h1>
      <p className="text-text-tertiary text-[13px]">Last updated: May 30, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        TradeVault (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy. This policy explains how we
        collect, use, and protect your personal data when you use our financial management platform.
      </p>

      <h2>2. Data We Collect</h2>

      <h3>2.1 Account Data</h3>
      <ul>
        <li>Email address (for authentication and communication)</li>
        <li>Name (optional, for display purposes)</li>
        <li>Password (hashed, never stored in plaintext)</li>
      </ul>

      <h3>2.2 Financial Data You Input</h3>
      <ul>
        <li>Trading account details (names, firms, balances)</li>
        <li>Payout records (amounts, dates, methods)</li>
        <li>Expense records (categories, amounts, vendors)</li>
        <li>Balance snapshots (historical tracking)</li>
      </ul>

      <h3>2.3 Technical Data</h3>
      <ul>
        <li>IP address (for security and rate limiting)</li>
        <li>Browser type and device information</li>
        <li>Usage patterns (pages visited, features used)</li>
      </ul>

      <h3>2.4 Payment Data</h3>
      <p>
        Payment processing is handled entirely by Stripe. We do not store credit card numbers,
        CVVs, or full payment details. We only receive confirmation of payment status from Stripe.
      </p>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To provide and maintain the Service</li>
        <li>To calculate analytics, metrics, and insights from your financial data</li>
        <li>To process payments via Stripe</li>
        <li>To send transactional emails (password resets, billing receipts)</li>
        <li>To improve the Service based on usage patterns</li>
        <li>To prevent fraud and ensure security</li>
      </ul>

      <h2>4. Data Storage &amp; Security</h2>
      <p>
        Your data is stored in a PostgreSQL database hosted on Supabase with encryption at rest.
        All data transmission uses TLS encryption. We implement Row Level Security (RLS) to ensure
        data isolation between users at the database level.
      </p>
      <p>Security measures include:</p>
      <ul>
        <li>Encrypted database (AES-256 at rest)</li>
        <li>TLS 1.3 for all data in transit</li>
        <li>Row Level Security for data isolation</li>
        <li>Rate limiting on API endpoints</li>
        <li>Session management with automatic expiry</li>
        <li>Hashed passwords (bcrypt)</li>
      </ul>

      <h2>5. Data Sharing</h2>
      <p>We do NOT:</p>
      <ul>
        <li>Sell your personal or financial data to third parties</li>
        <li>Share your data with advertisers</li>
        <li>Use your financial data for purposes other than providing the Service</li>
        <li>Aggregate your data for benchmarks without explicit opt-in consent</li>
      </ul>
      <p>We share data only with:</p>
      <ul>
        <li><strong>Stripe</strong> — for payment processing</li>
        <li><strong>Resend</strong> — for transactional emails</li>
        <li><strong>Vercel</strong> — for hosting (no data access)</li>
        <li><strong>Supabase</strong> — for database hosting</li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access</strong> — request a copy of all your data (via CSV export)</li>
        <li><strong>Rectification</strong> — update or correct your data at any time</li>
        <li><strong>Erasure</strong> — delete your account and all associated data</li>
        <li><strong>Portability</strong> — export your data in machine-readable format (CSV)</li>
        <li><strong>Restriction</strong> — request that we limit processing of your data</li>
      </ul>

      <h2>7. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active. If you delete your account,
        all personal and financial data is permanently deleted within 30 days. Anonymized,
        aggregated statistics may be retained for product improvement.
      </p>

      <h2>8. Cookies</h2>
      <p>
        TradeVault uses only essential cookies for session management and authentication.
        We do not use tracking cookies, advertising cookies, or third-party analytics cookies.
      </p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>
        TradeVault is not intended for users under 18 years of age. We do not knowingly
        collect data from minors.
      </p>

      <h2>10. International Transfers</h2>
      <p>
        Your data may be processed in the United States and European Union through our
        infrastructure providers. All transfers comply with applicable data protection regulations.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this privacy policy periodically. We will notify you of material changes
        via email. Continued use after changes constitutes acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        For privacy inquiries or to exercise your rights, contact us at{" "}
        <a href="mailto:privacy@tradevault.app">privacy@tradevault.app</a>.
      </p>

      <h2>13. GDPR Compliance</h2>
      <p>
        For EU/EEA users: TradeVault processes data under the legal basis of contract performance
        (providing the Service you signed up for) and legitimate interest (security, product improvement).
        You may lodge a complaint with your local supervisory authority if you believe your rights
        have been infringed.
      </p>
    </article>
  );
}
