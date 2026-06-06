import { Lock, Zap, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Hosted by NACOS OAU Chapter
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white text-balance leading-tight mb-6">
            Speak freely.
            <br />
            <span className="text-gold-300">No one will know.</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 text-balance">
            Share honest feedback on what matters to you. No accounts. No emails. No tracking. 
            Just your voice — completely protected.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              { icon: Lock, label: 'Zero personal data collected' },
              { icon: Zap, label: 'No account required' },
              { icon: Users, label: 'Voices heard anonymously' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/80 text-sm">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative h-8">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 32L1440 32L1440 16C1440 16 1080 0 720 0C360 0 0 16 0 16L0 32Z" fill="#fafaf9"/>
        </svg>
      </div>
    </section>
  );
}