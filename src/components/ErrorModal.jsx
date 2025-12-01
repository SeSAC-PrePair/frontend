import Modal from './Modal'
import './ErrorModal.css'

/**
 * 서버 오류나 예기치 못한 에러를 사용자에게 친화적으로 표시하는 모달
 * @param {boolean} open - 모달 표시 여부
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {string} title - 모달 제목 (기본값: "오류가 발생했습니다")
 * @param {string} message - 에러 메시지
 * @param {string} type - 에러 타입 ('server' | 'network' | 'general')
 */
export default function ErrorModal({ 
    open, 
    onClose, 
    title = '오류가 발생했습니다',
    message,
    type = 'general'
}) {
    const getErrorIcon = () => {
        switch (type) {
            case 'server':
                return '⚠️'
            case 'network':
                return '🌐'
            default:
                return '❌'
        }
    }

    const getErrorMessage = () => {
        if (message) return message
        
        switch (type) {
            case 'server':
                return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            case 'network':
                return '네트워크 연결을 확인해주세요.'
            default:
                return '예기치 못한 오류가 발생했습니다.'
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="error-modal__footer">
                    <button
                        type="button"
                        className="cta-button cta-button--primary"
                        onClick={onClose}
                    >
                        확인
                    </button>
                </div>
            }
        >
            <div className="error-modal__content">
                <div className="error-modal__icon">{getErrorIcon()}</div>
                <p className="error-modal__message">{getErrorMessage()}</p>
                <div className="error-modal__help">
                    <p>
                        문제가 계속되면 관리자에게 문의해주세요.
                    </p>
                    <p className="error-modal__contact">
                        문의: <a href="mailto:support@prepair.wisoft.dev">support@prepair.wisoft.dev</a>
                    </p>
                </div>
            </div>
        </Modal>
    )
}


