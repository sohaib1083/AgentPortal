'use client'

import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen font-mono bg-[#fcf5e5] text-[#2c1b18] flex flex-col">
      <header className="px-8 py-6 bg-[#ffe7b2] border-b-4 border-[#c46b00] shadow-md">
        <h1 className="text-3xl font-extrabold text-[#b9314f] tracking-widest">About Global</h1>
      </header>
      <div className="flex-1 p-8 space-y-4">
        <p>
          Global is a retro-inspired real estate platform empowering agents and administrators with modern tools.
        </p>
        <p>
          This page highlights the mission and vision behind the project. Stay tuned for more updates!
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-[#b9314f] text-white px-4 py-2 rounded w-fit hover:bg-[#91203b]"
        >
          Back to Home
        </button>
      </div>
    </main>
  )
}
