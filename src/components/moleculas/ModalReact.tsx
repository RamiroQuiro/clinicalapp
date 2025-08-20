import { CircleX } from 'lucide-react';
import React from 'react';

type Props = {
  onClose: (value: boolean) => void;
  children: React.ReactNode;
  className?: string;
  title: string;
  id: string;
};

export default function ModalReact({ onClose, children, className, title, id }: Props) {
  return (
    <div
      style={{ margin: 0, position: 'fixed' }}
      className="fixed top-0 left-0 mt-0 w-full h-screen z-[80] bg-black bg-opacity-50 flex items-center  justify-center backdrop-blur-sm"
      onClick={() => onClose(false)}
    >
      <div
        className={`bg-white relative rounded-lg overflow-hidden border-l-2 text-border-primary-100/80 mt-0 shadow-lg h- md:min-h-[50vh] overflow-y-auto md:min-w-[40vw] ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Fijo */}
        <div className="flex justify-between items-center p-4 border-b bg-primary-bg-componentes flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            id={`modal-close-${id}`}
            className="text-gray-500 hover:text-primary-100 transition-colors rounded-full p-1"
            onClick={() => onClose(false)}
          >
            <CircleX size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
}
