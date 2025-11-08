import { useEffect } from "react";
import { X } from "lucide-react";

/* Modern Professional Modal Component */
function Modal({ isOpen, onClose, title, children, size = "md" }) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size variants
  const sizeClasses = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Center the modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal Container */}
        <div
          className={`inline-block w-full ${sizeClasses[size]} my-8 text-left align-middle transition-all duration-300 ease-out transform`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 ease-out scale-100 opacity-100 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <h3
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900 leading-6"
                  >
                    {title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="relative w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6">{children}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fadeOut {
          animation: fadeOut 0.2s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

export default Modal;
