import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, Github, Twitter } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Thank you for your message! We will get back to you soon.');
  };

  const contactMethods = [
    {
      icon: MessageSquare,
      title: "Discord Community",
      description: "Join our active community for real-time support and discussions",
      link: "https://discord.gg/ovmars",
      linkText: "Join Discord"
    },
    {
      icon: Twitter,
      title: "Twitter/X",
      description: "Follow us for updates, announcements, and platform news",
      link: "https://twitter.com/ovmars",
      linkText: "Follow @OVMARS"
    },
    {
      icon: Github,
      title: "GitHub",
      description: "Contribute to our open-source project or report issues",
      link: "https://github.com/ovmars",
      linkText: "View Repository"
    },
    {
      icon: Mail,
      title: "Email",
      description: "For official inquiries and business partnerships",
      link: "mailto:contact@ovmars.army",
      linkText: "contact@ovmars.army"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="home" />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get in touch with the OVMARS ARMY team. We're here to help!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Form */}
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="mt-2 bg-background/50 border-primary/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="mt-2 bg-background/50 border-primary/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this about?"
                    className="mt-2 bg-background/50 border-primary/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    className="mt-2 bg-background/50 border-primary/30 min-h-32"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-6"
                >
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Methods */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Other Ways to Reach Us</h2>
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <Card 
                    key={index}
                    className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary transition-colors">
                        <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
                        <p className="text-muted-foreground mb-3">{method.description}</p>
                        <a 
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-2"
                        >
                          {method.linkText}
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ Reference */}
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary/30 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Looking for Quick Answers?
            </h2>
            <p className="text-muted-foreground mb-6">
              Check out our FAQ page for answers to commonly asked questions
            </p>
            <a href="/faq">
              <Button className="bg-primary hover:bg-primary/80 text-white font-semibold px-8">
                Visit FAQ
              </Button>
            </a>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
