import { useEffect, useRef } from 'react'

export default function PASModal({ result, isOpen, onClose, dealBroker, onSend }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    // Focus the panel when it opens
    panelRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose()
        return
      }

      // Simple focus trap
      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSend() {
    onSend(result.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Raise PAS query"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md outline-none"
      >
        <div className="text-base font-medium text-gray-900 mb-4">Raise PAS query</div>

        <div className="mb-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</div>
          <div className="bg-gray-50 rounded p-2 text-sm text-gray-600">
            {dealBroker} — {result.id}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Query</div>
          <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 leading-relaxed min-h-[80px]">
            {result.pasTemplate}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSend}
            aria-label="Send PAS query to broker"
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
          >
            Send PAS query
          </button>
          <button
            onClick={onClose}
            aria-label="Cancel and close modal"
            className="border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
