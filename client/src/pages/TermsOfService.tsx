import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="home" />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last Updated: November 3, 2025
            </p>
          </div>

          {/* Content */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-8 md:p-12">
            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using STXWORX, you accept and agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our platform. These terms constitute 
                  a legally binding agreement between you and OVMARS ARMY.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Platform Description</h2>
                <p className="leading-relaxed">
                  STXWORX is a decentralized freelance marketplace built on the Stacks blockchain. We provide 
                  a platform for clients and freelancers to connect and transact using smart contracts. We do 
                  not directly provide freelance services, nor do we employ freelancers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Eligibility</h2>
                <ul className="list-disc list-inside space-y-2 leading-relaxed">
                  <li>You must be at least 18 years old to use this platform</li>
                  <li>You must have the legal capacity to enter into binding contracts</li>
                  <li>You must comply with all applicable laws in your jurisdiction</li>
                  <li>You must not be prohibited from using our services under any law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Wallet and Account Security</h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    <strong className="text-white">Your Responsibility:</strong> You are solely responsible 
                    for maintaining the security of your wallet and private keys. We do not have access to 
                    your private keys and cannot recover lost or stolen funds.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-white">No Recovery:</strong> If you lose your private keys or 
                    wallet access, we cannot help you recover your account or funds.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Smart Contracts and Escrow</h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    All transactions on STXWORX are governed by smart contracts deployed on the Stacks blockchain. 
                    Once funds are locked in escrow, they are controlled by the smart contract code, not by STXWORX 
                    or OVMARS ARMY.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-white">Immutability:</strong> Blockchain transactions are immutable 
                    and cannot be reversed. Ensure all transaction details are correct before confirming.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-white">No Guarantees:</strong> While we strive for security, we do 
                    not guarantee the smart contracts are bug-free. Use at your own risk.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. User Conduct</h2>
                <p className="leading-relaxed mb-3">Users agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 leading-relaxed">
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Violate intellectual property rights</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Upload malicious code or attempt to hack the platform</li>
                  <li>Create fake profiles or manipulate the system</li>
                  <li>Use the platform for money laundering or terrorist financing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Fees and Payments</h2>
                <p className="leading-relaxed">
                  STXWORX charges platform fees for facilitating transactions. All fees are transparently 
                  displayed before you commit to a transaction. Payment is made in STX tokens through smart 
                  contracts. You are also responsible for blockchain gas fees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Dispute Resolution</h2>
                <p className="leading-relaxed">
                  In case of disputes between clients and freelancers, the smart contract includes dispute 
                  resolution mechanisms. We are working on implementing a decentralized arbitration system. 
                  STXWORX acts as a neutral platform and does not take sides in disputes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Intellectual Property</h2>
                <p className="leading-relaxed">
                  Users retain ownership of their work and content. By using the platform, you grant STXWORX 
                  a license to display your content for platform operation purposes. Our platform code, design, 
                  and branding are protected by intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  STXWORX and OVMARS ARMY are provided "as is" without warranties of any kind. We are not 
                  liable for any losses, damages, or issues arising from your use of the platform, including 
                  but not limited to financial losses, smart contract bugs, or blockchain network issues.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
                <p className="leading-relaxed">
                  You agree to indemnify and hold harmless STXWORX, OVMARS ARMY, and our affiliates from any 
                  claims, damages, or expenses arising from your use of the platform or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Termination</h2>
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate access to our platform for users who violate 
                  these terms. You may stop using the platform at any time by disconnecting your wallet.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We may update these Terms of Service from time to time. Continued use of the platform after 
                  changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">14. Governing Law</h2>
                <p className="leading-relaxed">
                  These terms are governed by the laws of the jurisdiction in which OVMARS ARMY operates, 
                  without regard to conflict of law principles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
                <p className="leading-relaxed">
                  For questions about these Terms of Service, please visit our Contact page or reach out 
                  through our Discord community.
                </p>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
