import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="home" />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last Updated: November 3, 2025
            </p>
          </div>

          {/* Content */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-8 md:p-12">
            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p className="leading-relaxed">
                  Welcome to STXWORX, operated by OVMARS ARMY. We are committed to protecting your privacy 
                  and ensuring transparency in how we handle your information. This Privacy Policy explains 
                  how we collect, use, and protect your data when you use our decentralized freelance platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    <strong className="text-white">Blockchain Data:</strong> We collect publicly available 
                    blockchain information including your Stacks wallet address, transaction history, and 
                    smart contract interactions.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-white">Profile Information:</strong> Information you provide when 
                    creating projects or profiles, such as project descriptions, milestones, and professional details.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-white">Usage Data:</strong> We collect information about how you 
                    interact with our platform, including pages visited, features used, and time spent on the platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 leading-relaxed">
                  <li>To provide and maintain our decentralized platform services</li>
                  <li>To facilitate smart contract interactions and escrow transactions</li>
                  <li>To display project information and connect clients with freelancers</li>
                  <li>To improve our platform and user experience</li>
                  <li>To communicate important updates and security notices</li>
                  <li>To comply with legal obligations and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Blockchain Transparency</h2>
                <p className="leading-relaxed">
                  As a blockchain-based platform, certain information is permanently recorded on the Stacks 
                  blockchain and is publicly accessible. This includes transaction amounts, wallet addresses, 
                  and smart contract interactions. This data cannot be deleted or modified due to the immutable 
                  nature of blockchain technology.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your information. However, we 
                  do not store your private keys or have access to your wallet funds. You are responsible for 
                  maintaining the security of your wallet and private keys.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Services</h2>
                <p className="leading-relaxed">
                  Our platform integrates with third-party wallet providers (such as Leather and Xverse) and 
                  the Stacks blockchain. These services have their own privacy policies, and we encourage you 
                  to review them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
                <p className="leading-relaxed">
                  You have the right to access, update, or delete your off-chain profile information. However, 
                  blockchain transactions cannot be deleted due to their immutable nature. You can disconnect 
                  your wallet at any time to stop using our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking</h2>
                <p className="leading-relaxed">
                  We use minimal cookies and local storage to maintain your session and preferences. We do not 
                  use third-party tracking or advertising cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our platform is not intended for users under the age of 18. We do not knowingly collect 
                  information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify users of significant 
                  changes through our platform or community channels.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us through our Discord 
                  community or visit our Contact page.
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
