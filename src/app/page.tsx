'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen font-mono bg-[#fcf5e5] text-[#2c1b18]">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 bg-[#ffe7b2] border-b-4 border-[#c46b00] shadow-md">
        <h1 className="text-3xl font-extrabold text-[#b9314f] tracking-widest">Global</h1>
        <nav className="space-x-6 text-sm font-medium">
          <a href="/" className="hover:text-[#b9314f] transition">Home</a>
          <a href="/about" className="hover:text-[#b9314f] transition">About</a>
          <a href="#" className="hover:text-[#b9314f] transition">Contact</a>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#b9314f] text-white px-4 py-2 rounded hover:bg-[#91203b] transition"
          >
            Agent Login
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-[#e8dacb] flex-1 flex items-center justify-center text-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="z-10"
        >
          <h2 className="text-5xl font-extrabold mb-4">Welcome to Global</h2>
          <p className="text-lg mb-6 font-medium">Your retro-inspired hub for real estate empowerment.</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="bg-[#fff8dc] text-[#b9314f] border border-[#b9314f] px-6 py-3 rounded hover:bg-[#fce8d2] font-semibold"
            >
              Agent Login
            </button>
            <button
              onClick={() => router.push('/admin-login')}
              className="bg-[#b9314f] text-white px-6 py-3 rounded font-semibold hover:bg-[#91203b] transition"
            >
              Admin Panel
            </button>

          </div>
          <div className="mt-6">
            <span className="inline-block bg-yellow-400 text-black px-4 py-1 text-sm font-bold rounded shadow-sm">
              🚧 Under Construction — New Features Coming Soon!
            </span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-8 bg-[#fffdf7] border-t border-[#dab88b]">
        <h3 className="text-3xl font-bold text-center text-[#b9314f] mb-12">Platform Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { title: 'Verified Listings', icon: '🏡', desc: 'Discover and manage properties easily.' },
            { title: 'Agent Tools', icon: '🛠️', desc: 'Track progress and performance with flair.' },
            { title: 'Retro Analytics', icon: '📼', desc: 'Groovy stats and classic dashboards.' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-[#fef6e4] p-6 rounded-lg shadow border border-[#dab88b] text-center"
            >
              <div className="text-4xl">{feature.icon}</div>
              <h4 className="text-xl font-semibold mt-2 mb-1">{feature.title}</h4>
              <p className="text-[#6b4c3b] text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#ffe7b2] text-center py-6 text-xs text-[#432818] border-t-2 border-[#c46b00]">
        © {new Date().getFullYear()} Global — All rights reserved.
      </footer>
    </main>
  )
}
