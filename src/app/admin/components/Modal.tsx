'use client'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'error' | 'success'
}

export default function Modal({ isOpen, onClose, title, message, type = 'error' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative z-50 bg-white bg-opacity-90 backdrop-blur-sm border border-[#dab88b] p-6 rounded-lg shadow-xl max-w-sm w-full pointer-events-auto animate-fade-in">
        <h2
          className={`text-xl font-semibold mb-3 ${
            type === 'error' ? 'text-red-600' : 'text-green-700'
          }`}
        >
          {title || (type === 'error' ? 'Error' : 'Success')}
        </h2>
        <p className="text-[#432818] mb-6">{message}</p>
        <div className="text-right">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded transition font-semibold ${
              type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
