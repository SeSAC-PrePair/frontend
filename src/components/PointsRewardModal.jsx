import { AnimatePresence, motion as Motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import './PointsRewardModal.css'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.4
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  },
}

const confettiVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 0.3
    }
  },
}

export default function PointsRewardModal({ open, onClose, points }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    
    // 3초 후 자동으로 닫기
    const timer = setTimeout(() => {
      onClose?.()
    }, 3000)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      clearTimeout(timer)
    }
  }, [open, onClose])

  if (typeof document === 'undefined' || !open) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <Motion.div
          className="points-reward-modal"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="presentation"
          onClick={() => onClose?.()}
        >
          <Motion.div
            className="points-reward-modal__content"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="points-reward-title"
            onClick={(event) => event.stopPropagation()}
          >
            <Motion.div
              className="points-reward-modal__confetti"
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
            >
              🎉
            </Motion.div>
            <h2 id="points-reward-title" className="points-reward-modal__title">
              포인트 적립 완료!
            </h2>
            <div className="points-reward-modal__points">
              <span className="points-reward-modal__points-label">적립된 포인트</span>
              <span className="points-reward-modal__points-value">+{points.toLocaleString()}</span>
            </div>
            <p className="points-reward-modal__message">
              오늘의 질문에 답변해주셔서 감사합니다!
              <br />
              계속해서 연습하시면 더 많은 포인트를 받을 수 있어요.
            </p>
            <button
              type="button"
              className="points-reward-modal__close-btn"
              onClick={() => onClose?.()}
            >
              확인
            </button>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}


