'use client'

import { FiAlertTriangle } from 'react-icons/fi';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  agent?: any;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Delete', 
  message,
  agent
}: DeleteConfirmModalProps) {
  // Add the backdrop style object
  const backdropStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)' // For Safari support
  };
  
  if (!isOpen) return null;
  
  return (
    // Update to use the style prop instead of classes for backdrop
    <div 
      className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4"
      style={backdropStyle}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Rest of your modal content */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-center text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-500 text-center mb-6 whitespace-pre-line">
          {message}
        </div>
        
        {agent && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{agent.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{agent.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Level:</span>
                <p className="font-medium">{agent.level}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Sales:</span>
                <p className="font-medium">Rs. {agent.totalSales?.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#dab88b] text-[#432818] rounded-md hover:bg-[#fff3dd] focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}