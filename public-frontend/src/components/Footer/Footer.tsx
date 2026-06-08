import { Link } from 'react-router-dom';
import { 
  RiBook3Line, 
  RiFacebookCircleLine, 
  RiTwitterXLine, 
  RiInstagramLine, 
  RiLinkedinBoxLine,
  RiHeartLine
} from 'react-icons/ri';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Navigation Directory Groups updated with valid routes from App.tsx
  const footerLinks = {
    explore: [
      { label: "All Books Collection", path: "/all-books" },
      { label: "Browse Genres", path: "/genres" },
      { label: "Popular Authors", path: "/authors" },
      { label: "Categories Catalog", path: "/categories" }
    ],
    account: [
      { label: "Shopping Cart", path: "/cart" },
      { label: "My Wishlist", path: "/wishlist" },
      { label: "Track My Orders", path: "/my-orders" },
      { label: "Portal Join / Login", path: "/login" }
    ],
    support: [
      { label: "Help Center", path: "#" },
      { label: "Terms of Service", path: "#" },
      { label: "Privacy Policy", path: "#" },
      { label: "Contact Relations", path: "#" }
    ]
  };

  return (
    <footer className="bg-[#0B0F19] text-white border-t border-white/[0.04] pt-20 pb-10 px-4 md:px-8 select-none">
      <div className="max-w-[1400px] mx-auto">
        
        {/* MAIN LAYOUT CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 border-b border-white/[0.06] pb-16 mb-10">
          
          {/* Brand Identity Branding Column */}
          <div className="lg:col-span-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 text-white text-xl font-serif font-normal tracking-tight mb-5 group outline-none">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white flex items-center justify-center group-hover:bg-white group-hover:text-[#0B0F19] group-hover:border-white transition-all duration-300 shadow-inner">
                <RiBook3Line size={16} />
              </div>
              <span className="font-semibold tracking-wide">Pana<span className="italic font-light text-white/60">.Hub</span></span>
            </Link>
            <p className="text-white/50 font-sans text-xs md:text-sm leading-relaxed mb-6 font-normal">
              Empowering independent literature communities by connecting local readers with local, verified, and trusted bookstore fulfillment networks nationwide.
            </p>
            
            {/* Social Connection Glass Icons */}
            <div className="flex gap-2.5">
              {[
                { icon: <RiFacebookCircleLine size={16} />, label: "Facebook" },
                { icon: <RiTwitterXLine size={14} />, label: "Twitter" },
                { icon: <RiInstagramLine size={16} />, label: "Instagram" },
                { icon: <RiLinkedinBoxLine size={16} />, label: "LinkedIn" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/30 hover:bg-white hover:text-[#0B0F19] flex items-center justify-center transition-all duration-300 text-white/40 shadow-3xs active:scale-90" 
                  aria-label={`${social.label} Portal Entry Link`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Directory Column: Explore */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-[1px] w-3 bg-white/20" />
              <h4 className="font-serif font-medium text-xs tracking-wider uppercase text-white/90">
                Explore
              </h4>
            </div>
            <ul className="space-y-3.5">
              {footerLinks.explore.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="font-sans text-xs text-white/40 hover:text-white transform hover:translate-x-1 inline-block transition-all duration-200 outline-none font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Directory Column: Account & Orders */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-[1px] w-3 bg-white/20" />
              <h4 className="font-serif font-medium text-xs tracking-wider uppercase text-white/90">
                Dashboard
              </h4>
            </div>
            <ul className="space-y-3.5">
              {footerLinks.account.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="font-sans text-xs text-white/40 hover:text-white transform hover:translate-x-1 inline-block transition-all duration-200 outline-none font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Directory Column: Support */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-[1px] w-3 bg-white/20" />
              <h4 className="font-serif font-medium text-xs tracking-wider uppercase text-white/90">
                Legal Matrix
              </h4>
            </div>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="font-sans text-xs text-white/40 hover:text-white transform hover:translate-x-1 inline-block transition-all duration-200 outline-none font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* FOOTER BASE ATTRIBUTION REGION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/30 font-semibold tracking-wider uppercase font-sans">
          <p>© {currentYear} Pana.Hub Inc. All rights reserved.</p>
          <div className="flex items-center gap-1.5 normal-case tracking-normal font-medium text-white/20">
            <span>Built with devotion for local indie shelves</span>
            <RiHeartLine className="w-3.5 h-3.5 text-red-500/60 fill-red-500/10" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;