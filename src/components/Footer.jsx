export default function Footer({ onOpenWaitlist }) {
  return (
    <footer className="bg-[#08082e] text-white">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left max-w-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              Don't miss your early merchant spot
            </h2>
            <p className="text-white/50 text-base">
              Join hundreds of African businesses already on the waitlist. Limited early access perks available.
            </p>
          </div>
          <button onClick={onOpenWaitlist} className="btn-primary shrink-0 text-base px-10">
            Secure My Spot
          </button>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/logo/giftseon-logo-white.png"
                alt="Giftseon merchants"
                className="h-28 w-auto object-contain"
              />
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Africa's premier gift marketplace, connecting merchants with gift shoppers across the country.
            </p>
            <div className="flex gap-3 mt-5">
              {['twitter', 'instagram', 'linkedin'].map(social => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-brand/30 flex items-center justify-center transition-colors"
                  aria-label={social}
                >
                  <div className="w-4 h-4 bg-white/60 rounded-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {['Features', 'Market Trends', 'Vendor Tools', 'Pricing', 'FAQ'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {['About Us', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <p>© {new Date().getFullYear()} Giftseon. All rights reserved.</p>
          <p>Built with ❤️ for African merchants</p>
        </div>
      </div>
    </footer>
  )
}
