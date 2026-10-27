import React from 'react';
import { Home, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-warm-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-forest flex items-center justify-center text-white">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-charcoal tracking-tight">
                Estate<span className="text-forest">Square</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Curated Indian real estate platform eliminating spam, duplicate listings, and broken communication. Verified properties, structured visits, and guaranteed owner moderation.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-forest font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Moderated Listings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-4">
              Explore Cities
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-muted">
              <li>
                <Link to="/search?city=Bangalore" className="hover:text-forest transition-colors">
                  Properties in Bangalore
                </Link>
              </li>
              <li>
                <Link to="/search?city=Mumbai" className="hover:text-forest transition-colors">
                  Properties in Mumbai
                </Link>
              </li>
              <li>
                <Link to="/search?city=Delhi%20NCR" className="hover:text-forest transition-colors">
                  Properties in Delhi NCR
                </Link>
              </li>
              <li>
                <Link to="/search?city=Hyderabad" className="hover:text-forest transition-colors">
                  Properties in Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/search?city=Pune" className="hover:text-forest transition-colors">
                  Properties in Pune
                </Link>
              </li>
            </ul>
          </div>

          {/* Workflows */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-4">
              Marketplace Workflows
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-muted">
              <li>Owner Direct Listing</li>
              <li>Mandatory Admin Moderation</li>
              <li>Time-Slot Visit Scheduling</li>
              <li>Double-Booking Conflict Guard</li>
              <li>Direct Buyer Enquiries</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-4">
              Support & Inquiries
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-muted">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-forest flex-shrink-0" />
                <span>Indiranagar, Bangalore, Karnataka 560038</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-forest flex-shrink-0" />
                <span>support@estatesquare.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-forest flex-shrink-0" />
                <span>+91 (80) 4567 8900</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-warm-200 flex flex-col sm:flex-row justify-between items-center text-xs text-charcoal-muted">
          <p>© {new Date().getFullYear()} EstateSquare India. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for clean, verified, and reliable real estate workflows.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
