import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/pages/SignupSuccess.css'

// --- 인라인 SVG 아이콘 ---

// 발송 중 (종이 비행기)
const PaperPlaneIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#0d6efd' }} // 기본 테마 색상 (파란색)
    >
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z"/>
    </svg>
);

// 발송 완료 (체크 써클)
const CheckCircleIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#198754' }} // 성공 색상 (초록색)
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

// --- 애니메이션 Variants ---

// [MODIFIED] 1. 스테이지(배경)용 Variants (단순 Fade-in/out)
const stageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

// [MODIFIED] 2. '발송 완료' 아이콘용 Variants
const sentIconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', damping: 15, stiffness: 300, duration: 0.5 }
    },
    exit: { opacity: 0, scale: 0.2, transition: { duration: 0.3 } }
};

// [MODIFIED] 3. '발송 중' 비행기 아이콘용 Variants (중앙에서 펄스)
const sendingIconVariants = {
    hidden: { opacity: 0, scale: 0.8 }, // 시작 (중앙, 안보임)
    visible: { // "보이는" 상태 = 펄스 애니메이션
        opacity: [0.7, 1, 0.7], // 투명도 0.7 -> 1 -> 0.7 반복
        scale: [1, 1.05, 1],    // 크기 100% -> 105% -> 100% 반복
        transition: {
            duration: 1.5,
            repeat: Infinity, // 'sent' 상태가 될 때까지 무한 반복
            ease: "easeInOut"
        }
    },
    exit: { // "사라지는" 상태
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
    }
};

export default function SignupSuccessPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('sending'); // 'sending', 'sent'

    useEffect(() => {
        // '발송 중' 애니메이션이 끝날 때쯤 '발송 완료'로 상태 변경
        const timer = setTimeout(() => {
            setStatus('sent');
        }, 2200); // 10분 시뮬레이션 (확인용)
        return () => clearTimeout(timer);
    }, []);

    const goToMyPage = () => {
        navigate('/rewards', { replace: true });
    };

    // AuthPage의 레이아웃 클래스를 재사용하여 일관성 유지
    return (
        <div className="auth signup-success">
            <motion.section
                className={`auth__form signup-success__card ${status === 'sent' ? 'signup-success__card--sent' : ''}`} // AuthPage와 동일한 카드 스타일 재사용
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <AnimatePresence mode="wait">
                    {status === 'sending' ? (
                        <motion.div
                            key="sending"
                            className="signup-success__stage"
                            variants={stageVariants} // 스테이지는 단순 fade-in
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* 아이콘에 펄스 애니메이션 적용 */}
                            <motion.div
                                variants={sendingIconVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit" // [MODIFIED] exit 속성 추가
                            >
                                <PaperPlaneIcon />
                            </motion.div>

                            {/* 텍스트도 motion.h2로 변경하여 fade-in 효과 추가 */}
                            <motion.h2
                                style={{ marginTop: '1.5rem', fontSize: '1.2rem', color: '#333' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            >
                                오늘의 질문을 발송 중입니다...
                            </motion.h2>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sent"
                            className="signup-success__stage signup-success__stage--sent"
                            variants={sentIconVariants} // '발송 완료'용 variant 사용
                            initial="hidden"
                            animate="visible"
                        >
                            <CheckCircleIcon />
                            <h2 style={{ marginTop: '1.5rem', fontSize: '1.4rem', color: '#198754' }}>
                                발송되었습니다!
                            </h2>
                            <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                                이메일을 확인해주세요.
                            </p>
                            <button
                                type="button"
                                onClick={goToMyPage}
                                className="cta-button cta-button--primary" // AuthPage와 동일한 버튼 스타일 재사용
                            >
                                마이페이지로 가기
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.section>
        </div>
    );
}