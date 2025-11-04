import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';

export default function FAQ() {
  const faqs = [
    {
      question: "What is STXWORX?",
      answer: "STXWORX is a decentralized freelance platform built on the Stacks blockchain, powered by Bitcoin and STX. It connects clients with talented freelancers while ensuring secure, trustless payments through smart contracts."
    },
    {
      question: "How does the escrow system work?",
      answer: "When a client creates a project, they lock funds in a smart contract escrow. The funds are held securely on the blockchain and are only released when the freelancer completes milestones and the client approves the work. This protects both parties."
    },
    {
      question: "What are the fees?",
      answer: "STXWORX charges a minimal platform fee to maintain the infrastructure. All fees are transparently displayed before you commit to a project. There are no hidden charges."
    },
    {
      question: "Do I need a crypto wallet?",
      answer: "Yes, you need a Stacks-compatible wallet like Leather or Xverse to interact with the platform. This wallet will be used to receive payments, lock funds, and sign transactions."
    },
    {
      question: "How do I get started as a freelancer?",
      answer: "Connect your Stacks wallet, browse available projects, and submit proposals for jobs that match your skills. Once a client accepts your proposal, you can start working and submit milestones for payment."
    },
    {
      question: "How do I create a project as a client?",
      answer: "Go to the Client Dashboard, click 'Create Project & Lock Funds', fill in the project details, set milestones, and lock the required STX amount in the smart contract. Freelancers can then browse and apply for your project."
    },
    {
      question: "What happens if there's a dispute?",
      answer: "Our smart contract includes dispute resolution mechanisms. If a disagreement occurs, the locked funds remain secure until the issue is resolved. We're working on implementing a decentralized arbitration system."
    },
    {
      question: "Can I withdraw locked funds?",
      answer: "As a client, funds can only be withdrawn according to the smart contract terms. Once milestones are completed and approved, payments are automatically released to the freelancer. Unused funds from incomplete milestones may be refundable based on the contract terms."
    },
    {
      question: "What blockchain networks are supported?",
      answer: "STXWORX operates on the Stacks blockchain, which settles on Bitcoin. This provides the security of Bitcoin with the smart contract capabilities of Stacks."
    },
    {
      question: "How are payments processed?",
      answer: "All payments are processed in STX (Stacks tokens) through smart contracts. Payments are instant once milestones are approved, with no intermediaries or delays."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all sensitive data is stored on the decentralized blockchain, ensuring transparency and security. We do not store your private keys or have access to your funds."
    },
    {
      question: "What is OVMARS ARMY?",
      answer: "OVMARS ARMY is the community behind STXWORX, consisting of blockchain enthusiasts, developers, and freelancers committed to building a decentralized future for work. Join us to be part of the revolution!"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="home" />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about STXWORX
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-primary/20 last:border-0"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary/30 p-8">
              <h2 className="text-2xl font-bold text-white mb-3">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join our community and get your questions answered by the OVMARS ARMY
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="https://discord.gg/ovmars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors"
                >
                  Join Discord
                </a>
                <a 
                  href="https://twitter.com/ovmars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
                >
                  Follow on Twitter
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
