import { AnimatePresence, motion as Motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import './Modal.css'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const sheetVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: 28, transition: { duration: 0.18, ease: 'easeIn' } },
}

export default function Modal({ open, onClose, title, children, footer, size = 'md', closeLabel = '닫기' }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="modal"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="presentation"
          onClick={() => onClose?.()}
        >
          <Motion.div
            className={`modal__dialog modal__dialog--${size}`}
            variants={sheetVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-heading' : undefined}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__header">
              {title && (
                <h2 id="modal-heading" className="modal__title">
                  {title}
                </h2>
              )}
              <button type="button" className="modal__close" onClick={() => onClose?.()} aria-label={closeLabel}>
                <span />
                <span />
              </button>
            </div>
            <div className="modal__body">{children}</div>
            {footer && <div className="modal__footer">{footer}</div>}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
