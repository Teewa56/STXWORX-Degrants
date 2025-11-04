import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Shield, Users, Zap, Target, Rocket, Heart } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Decentralization",
      description: "Built on blockchain technology to ensure transparency, security, and trustless transactions without intermediaries."
    },
    {
      icon: Users,
      title: "Community First",
      description: "OVMARS ARMY is a global community of developers, freelancers, and blockchain enthusiasts working together."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging the power of Stacks and Bitcoin to create the future of decentralized work platforms."
    },
    {
      icon: Target,
      title: "Fairness",
      description: "Smart contracts ensure fair payment terms and protect both clients and freelancers from disputes."
    },
    {
      icon: Rocket,
      title: "Growth",
      description: "Empowering freelancers and businesses to grow in the Web3 ecosystem with cutting-edge tools."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "We're passionate about building a better future for work, powered by blockchain technology."
    }
  ];

  const team = [
    {
      role: "Vision",
      description: "To create a global, decentralized marketplace where talent meets opportunity without borders or barriers."
    },
    {
      role: "Mission",
      description: "Empower freelancers and clients with secure, transparent, and efficient blockchain-based tools for collaboration."
    },
    {
      role: "Goal",
      description: "Build the largest Web3 freelance platform powered by Bitcoin and STX, serving the OVMARS ARMY community."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="home" />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About OVMARS ARMY
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A decentralized revolution in freelancing, powered by{' '}
              <span className="text-primary font-bold">$STX</span> and{' '}
              <span className="text-primary font-bold">$BTC</span>
            </p>
          </div>

          {/* Story Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/20 p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                OVMARS ARMY was born from a simple belief: the future of work should be decentralized, 
                transparent, and accessible to everyone. In a world where traditional platforms take 
                excessive fees and control your data, we saw an opportunity to build something better.
              </p>
              <p>
                Powered by the Stacks blockchain and secured by Bitcoin, STXWORX represents our 
                commitment to creating a trustless ecosystem where freelancers and clients can 
                collaborate without intermediaries. Smart contracts ensure fair payment, while 
                blockchain technology guarantees transparency.
              </p>
              <p>
                We're not just building a platform—we're building a movement. The OVMARS ARMY is a 
                community of pioneers, developers, and believers in Web3 technology. Together, we're 
                shaping the future of work, one decentralized project at a time.
              </p>
            </div>
          </Card>

          {/* Vision, Mission, Goals */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Vision, Mission & Goals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((item, index) => (
                <Card 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6 hover:border-primary/50 transition-all"
                >
                  <h3 className="text-xl font-bold text-primary mb-3">{item.role}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card 
                    key={index}
                    className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary transition-colors">
                        <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Technology Section */}
          <Card className="bg-gradient-to-br from-purple-500/5 to-primary/5 border-2 border-primary/20 p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Powered by Blockchain</h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                <strong className="text-white">Stacks Blockchain:</strong> We leverage Stacks' 
                smart contract capabilities to create trustless escrow systems, ensuring secure 
                and transparent transactions.
              </p>
              <p>
                <strong className="text-white">Bitcoin Security:</strong> By settling on Bitcoin, 
                we inherit the most secure and decentralized network in the world, giving our 
                users unparalleled protection.
              </p>
              <p>
                <strong className="text-white">Smart Contracts:</strong> Our Clarity smart contracts 
                automatically handle milestone payments, dispute resolution, and fund management, 
                eliminating the need for intermediaries.
              </p>
            </div>
          </Card>

          {/* Join Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary/30 p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join the OVMARS ARMY
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Be part of the decentralized work revolution. Connect with builders, 
                freelancers, and innovators shaping the future of Web3.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="https://discord.gg/ovmars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/80 transition-colors"
                >
                  Join Discord
                </a>
                <a 
                  href="https://twitter.com/ovmars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-bold text-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Follow on Twitter
                </a>
                <a 
                  href="https://github.com/ovmars" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-bold text-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Contribute on GitHub
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
