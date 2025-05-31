import { FiAlertTriangle } from 'react-icons/fi';

type SaleType = {
  _id: string;
  customerName: string;
  amount: number;
  productName: string;
};

interface SaleDeleteModalProps {
  sale: SaleType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SaleDeleteModal({ sale, isOpen, onClose, onConfirm }: SaleDeleteModalProps) {
  if (!isOpen || !sale) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Deletion</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Are you sure you want to delete this sale?
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Customer:</span>
                <p className="font-medium">{sale.customerName}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <p className="font-medium">Rs. {sale.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Property:</span>
                <p className="font-medium">{sale.productName}</p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-red-600 mb-6">
            This action cannot be undone. All data associated with this sale will be permanently removed.
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Delete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}