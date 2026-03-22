import React from 'react';
import { Instagram, Mail } from 'lucide-react';

const About = () => {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">About PrintForge</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PrintForge is a premium 3D printing service dedicated to helping creators,
            engineers, and businesses bring their ideas to life. We focus on precision,
            quality materials, and friendly support so your prototypes and products look
            and perform their best.
          </p>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-display font-bold text-center mb-12 text-foreground">Meet the Co-Founders</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Aayush */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-display font-bold text-primary">A</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Aayush</h3>
              <p className="text-muted-foreground mb-6">Co-Founder</p>
              <a 
                href="https://www.instagram.com/aayushy7777/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm font-medium">@aayushy7777</span>
              </a>
            </div>

            {/* Arpit */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5">
              <div className="w-24 h-24 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-display font-bold text-accent">A</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Arpit</h3>
              <p className="text-muted-foreground mb-6">Co-Founder</p>
              <a 
                href="https://www.instagram.com/arpit_ris/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm font-medium">@arpit_ris</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-secondary/30 rounded-3xl p-8 md:p-12 border border-border text-center">
          <h2 className="text-2xl font-display font-bold mb-4 text-foreground">Get in touch</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Have a custom design in mind or a question about our materials? We're always here to help you forge your next great idea.
          </p>
          <a 
            href="mailto:printforge.com@gmail.com" 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
          >
            <Mail className="w-5 h-5" />
            printforge.com@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
};

export default About;
