'use client'

import { AgentType } from '../../../types/Agent';
import { FiAlertTriangle } from 'react-icons/fi';

interface DeleteConfirmModalProps {
  agent: AgentType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ agent, isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  const backdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)' // For Safari support
  };

  if (!isOpen || !agent) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4"
      style={backdropStyle}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-[#dab88b]">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-red-100 rounded-full p-3 mr-3">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-[#432818]">Delete Agent</h3>
        </div>
        
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-3">
            Are you sure you want to delete the agent <span className="font-semibold">{agent.name}</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone and all associated data will be permanently removed.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}