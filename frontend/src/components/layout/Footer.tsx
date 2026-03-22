import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const logoUrl = 'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/logo/printforge%20logo.png';
  const [showLogoImage, setShowLogoImage] = useState(Boolean(logoUrl));

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              {showLogoImage ? (
                <img
                  src={logoUrl}
                  alt="PrintForge Logo"
                  className="w-12 h-12 object-contain"
                  onError={() => setShowLogoImage(false)}
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-secondary text-foreground flex items-center justify-center font-semibold text-sm">
                  PF
                </div>
              )}
              <span className="font-display text-xl font-medium text-foreground">
                Print<span className="text-accent">Forge</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium 3D printing services for creators, engineers, and businesses. 
              Bringing your ideas to life with precision and quality.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/printforge.in/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-medium text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Products', 'Custom Print', 'Materials', 'Pricing', 'About Us'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-medium text-foreground mb-6">Support</h4>
            <ul className="space-y-4">
              {['FAQ', 'Shipping Info', 'Returns Policy', 'Track Order', 'Contact Us'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-medium text-foreground mb-6">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe for exclusive offers and 3D printing tips.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-background border-border"
              />
              <Button size="default">
                Join
              </Button>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-accent" />
                <span>printforge.com@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-accent" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 PrintForge. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}