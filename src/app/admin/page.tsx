'use client'

import Modal from './components/Modal'

import { useEffect, useState } from 'react'

import { AgentType } from '../../types/Agent'


export default function AdminDashboard() {
  const [agents, setAgents] = useState<AgentType[]>([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState<'success' | 'error'>('error')


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
    });

    if (res.status === 409) {
        setModalMessage('Email already exists. Please use a different email.');
        setModalOpen(true);
        setModalType('error') // <- new state variable
        return;
    }

    if (res.ok) {
        form.reset();
        await fetchAgents(); // ✅ Important: Refresh the list
        setModalMessage('Agent created successfully!');
        setModalOpen(true);
        setModalType('success') // <- new state variable
        fetchAgents()
    } else {
        setModalMessage('An unexpected error occurred. Try again.');
        setModalOpen(true);
    }
    };


  const fetchAgents = async () => {
    const res = await fetch('/api/agents')
    const data = await res.json()
    setAgents(data)
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return (
    <div className="min-h-screen bg-[#fcf5e5] text-[#2c1b18] font-mono px-6 py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#b9314f] tracking-widest">
        Global Admin Panel
      </h1>

      <div className="max-w-6xl mx-auto bg-[#fffdf7] shadow-lg rounded-lg p-6 border border-[#dab88b]">
        <table className="w-full table-auto border text-sm">
          <thead>
            <tr className="bg-[#ffe7b2] text-left border-b border-[#dab88b]">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Level</th>
              <th className="p-2">Total Sales</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent: any) => (
              <tr key={agent._id} className="border-t border-[#dab88b] hover:bg-[#fff3dd] transition">
                <td className="p-2">{agent.name}</td>
                <td className="p-2">{agent.email}</td>
                <td className="p-2">{agent.level}</td>
                <td className="p-2">Rs. {agent.totalSales.toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={async () => {
                        const confirm = window.confirm('Are you sure you want to delete this agent?')
                        if (!confirm) return

                        const res = await fetch(`/api/agents/${agent._id}`, { method: 'DELETE' })

                        if (res.ok) {
                        alert('Agent deleted!')
                        fetchAgents()
                        } else {
                        alert('Failed to delete agent')
                        }
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                    >
                    Delete
                    </button>

                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-[#b9314f] text-center">Add New Agent</h2>

        <form
        onSubmit={handleSubmit}
        className="bg-[#fff8dc] border border-[#dab88b] mt-4 p-6 rounded-lg space-y-4 max-w-lg mx-auto shadow"
        >
        <div>
            <label className="block mb-1 text-sm font-medium text-[#432818]">Name</label>
            <input
            name="name"
            type="text"
            required
            className="w-full border px-3 py-2 rounded outline-[#dab88b]"
            />
        </div>
        <div>
            <label className="block mb-1 text-sm font-medium text-[#432818]">Email</label>
            <input
            name="email"
            type="email"
            required
            className="w-full border px-3 py-2 rounded outline-[#dab88b]"
            />
        </div>
        <button
            type="submit"
            className="w-full bg-[#b9314f] text-white px-4 py-2 rounded font-bold hover:bg-[#91203b] transition"
        >
            Create Agent
        </button>
        </form>
        <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        type={modalType}
        />


      </div>
    </div>
  )
}
