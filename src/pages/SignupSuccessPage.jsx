import { motion } from 'framer-motion'

import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppState } from '../context/AppStateContext'
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
    const { signup } = useAppState();
    const [firstInterviewSent, setFirstInterviewSent] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [signupCompleted, setSignupCompleted] = useState(false);
    const [userId, setUserId] = useState(null);

    // URL query params에서 카카오 인증 성공 여부 확인
    const searchParams = new URLSearchParams(location.search);
    const kakaoSuccess = searchParams.get('kakao') === 'success';
    const emailFromQuery = searchParams.get('email');
    
    // localStorage에서 회원가입 정보 읽기
    const [pendingSignup, setPendingSignup] = useState(null);
    
    useEffect(() => {
        const saved = localStorage.getItem('pendingSignup');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setPendingSignup(data);
                console.log('[SignupSuccess] localStorage에서 회원가입 정보 읽음:', data);
            } catch (e) {
                console.error('[SignupSuccess] localStorage 파싱 오류:', e);
            }
        }
    }, []);

    // 회원가입 완료 시 첫 인터뷰 질문 발송 (카카오 알림 없는 경우)
    useEffect(() => {
        const userIdFromState = location.state?.userId;
        if (userIdFromState && !userId) {
            setUserId(userIdFromState);
            setSignupCompleted(true);
            
            // /first 호출
            console.log('[SignupSuccess] 첫 인터뷰 질문 발송 시작');
            fetch('/api/interviews/first', {
                method: 'POST',
                headers: {
                    'X-User-ID': userIdFromState,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
                .then(response => {
                    if (!response.ok) {
                        console.error('[SignupSuccess] /first 실패:', response.status);
                    } else {
                        console.log('[SignupSuccess] ✅ 첫 인터뷰 질문 발송 성공');
                    }
                })
                .catch(error => {
                    console.error('[SignupSuccess] /first 오류:', error);
                });
        }
    }, [location.state, userId]);

    const goToMyPage = () => {
        navigate('/rewards', { replace: true });
    };

    const handleKakaoAuth = () => {
        // 카카오 인증 페이지로 직접 리다이렉트 (실제 백엔드 URL 사용)
        if (userId) {
            window.location.href = `https://prepair.wisoft.dev/api/auth/kakao?user_id=${encodeURIComponent(userId)}`;
        } else {
            // userId가 없는 경우 설정 페이지로 이동
            navigate('/settings', { replace: true });
        }
    };

    const handleSignupSubmit = async () => {
        if (!pendingSignup) {
            alert('회원가입 정보를 찾을 수 없습니다.');
            return;
        }

        setIsSigningUp(true);
        try {
            const result = await signup({
                ...pendingSignup,
                kakaoAuthCompleted: true,
                notificationKakao: true
            });

            console.log('[SignupSuccess] 회원가입 완료:', result);
            
            setUserId(result?.userId);
            setSignupCompleted(true);
            
            // 첫 인터뷰 질문 발송
            if (result?.userId) {
                fetch('/api/interviews/first', {
                    method: 'POST',
                    headers: {
                        'X-User-ID': result.userId,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                })
                    .then(response => {
                        if (!response.ok) {
                            console.error('[SignupSuccess] /first 실패:', response.status);
                        } else {
                            console.log('[SignupSuccess] ✅ 첫 인터뷰 질문 발송 성공');
                        }
                    })
                    .catch(error => {
                        console.error('[SignupSuccess] /first 오류:', error);
                    });
            }

            // localStorage에서 pendingSignup 제거
            localStorage.removeItem('pendingSignup');
        } catch (error) {
            console.error('[SignupSuccess] 회원가입 오류:', error);
            alert(error.message || '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSigningUp(false);
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
                        {signupCompleted ? '회원가입이 완료되었습니다!' : '카카오톡 인증 완료!'}
                    </h2>
                    <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                        {signupCompleted ? 'PrePair에 오신 것을 환영합니다.' : '이제 회원가입을 완료해주세요.'}
                    </p>
                    
                    {/* 카카오 인증 완료 & 회원가입 대기 중 */}
                    {kakaoSuccess && pendingSignup && !signupCompleted && (
                        <div style={{ 
                            marginBottom: '1rem', 
                            padding: '1rem', 
                            backgroundColor: '#d1e7dd', 
                            borderRadius: '8px',
                            border: '1px solid #198754',
                            fontSize: '0.9rem',
                            color: '#0f5132'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                                ✅ 카카오톡 인증 완료
                            </p>
                            <p style={{ margin: 0 }}>
                                아래 버튼을 눌러 회원가입을 완료해주세요.
                            </p>
                        </div>
                    )}
                    
                    {/* 회원가입 완료 */}
                    {signupCompleted && (
                        <div style={{ 
                            marginBottom: '1rem', 
                            padding: '1rem', 
                            backgroundColor: '#d1e7dd', 
                            borderRadius: '8px',
                            border: '1px solid #198754',
                            fontSize: '0.9rem',
                            color: '#0f5132'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                                ✅ 회원가입 및 카카오톡 알림 설정 완료
                            </p>
                            <p style={{ margin: 0 }}>
                                이제 카카오톡으로 면접 질문 알림을 받으실 수 있습니다.
                            </p>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                        {/* 카카오 인증 완료 & 회원가입 대기 중: 회원가입 완료 버튼 */}
                        {kakaoSuccess && pendingSignup && !signupCompleted && (
                            <button
                                type="button"
                                onClick={handleSignupSubmit}
                                className="cta-button cta-button--primary"
                                disabled={isSigningUp}
                            >
                                {isSigningUp ? '회원가입 진행 중...' : '회원가입 완료'}
                            </button>
                        )}
                        
                        {/* 회원가입 완료: 시작하기 버튼 */}
                        {signupCompleted && (
                            <button
                                type="button"
                                onClick={goToMyPage}
                                className="cta-button cta-button--primary"
                            >
                                시작하기
                            </button>
                        )}
                        
                        {/* 카카오 알림 안 한 경우: 마이페이지로 가기 */}
                        {!kakaoSuccess && !pendingSignup && (
                            <button
                                type="button"
                                onClick={goToMyPage}
                                className="cta-button cta-button--primary"
                            >
                                마이페이지로 가기
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.section>
        </div>
    );
}