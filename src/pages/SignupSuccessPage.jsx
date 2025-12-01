import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/pages/SignupSuccess.css'

// --- 인라인 SVG 아이콘 ---

// 체크 써클 아이콘
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

export default function SignupSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // location.state에서 카카오 인증 필요 여부 확인
    const needsKakaoAuth = location.state?.needsKakaoAuth || false;
    const userId = location.state?.userId;

    // 카카오 알림이 설정되어 있고 userId가 있으면 자동으로 카카오 인증 페이지로 리다이렉트
    useEffect(() => {
        if (needsKakaoAuth && userId) {
            // 약간의 지연을 두어 사용자에게 회원가입 성공 메시지를 볼 수 있게 함
            const timer = setTimeout(() => {
                window.location.href = `/api/auth/kakao?user_id=${encodeURIComponent(userId)}`;
            }, 1000); // 1초 후 자동 리다이렉트
            
            return () => clearTimeout(timer);
        }
    }, [needsKakaoAuth, userId]);

    const goToMyPage = () => {
        navigate('/rewards', { replace: true });
    };
    
    const handleKakaoAuth = () => {
        // 카카오 인증 페이지로 직접 리다이렉트
        if (userId) {
            window.location.href = `/api/auth/kakao?user_id=${encodeURIComponent(userId)}`;
        } else {
            // userId가 없는 경우 설정 페이지로 이동
            navigate('/settings', { replace: true });
        }
    };

    // AuthPage의 레이아웃 클래스를 재사용하여 일관성 유지
    return (
        <div className="auth signup-success">
            <motion.section
                className="auth__form signup-success__card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="signup-success__stage"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <CheckCircleIcon />
                    <h2 style={{ marginTop: '1.5rem', fontSize: '1.4rem', color: '#198754' }}>
                        회원가입이 완료되었습니다!
                    </h2>
                    <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                        PrePair에 오신 것을 환영합니다.
                    </p>
                    
                    {needsKakaoAuth && (
                        <div style={{ 
                            marginBottom: '1rem', 
                            padding: '1rem', 
                            backgroundColor: '#fff3cd', 
                            borderRadius: '8px',
                            border: '1px solid #ffc107',
                            fontSize: '0.9rem',
                            color: '#856404'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                                ⚠️ 카카오톡 알림 설정 필요
                            </p>
                            <p style={{ margin: 0 }}>
                                카카오톡 알림을 받으려면 카카오 인증을 완료해주세요.
                            </p>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                        {needsKakaoAuth && (
                            <button
                                type="button"
                                onClick={handleKakaoAuth}
                                className="cta-button cta-button--primary"
                                style={{ marginBottom: '0.5rem' }}
                            >
                                카카오 인증하러 가기
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={goToMyPage}
                            className={needsKakaoAuth ? "cta-button cta-button--ghost" : "cta-button cta-button--primary"}
                        >
                            마이페이지로 가기
                        </button>
                    </div>
                </motion.div>
            </motion.section>
        </div>
    );
}