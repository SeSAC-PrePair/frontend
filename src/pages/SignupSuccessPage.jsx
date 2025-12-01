import { motion } from 'framer-motion'

import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
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
    const { user, signup, login } = useAppState();
    const [firstInterviewSent, setFirstInterviewSent] = useState(false);
    const [signupCompleted, setSignupCompleted] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const signupAttempted = useRef(false); // 회원가입 중복 실행 방지

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

    // 카카오 인증 완료 후 회원가입 진행
    useEffect(() => {
        // 이미 처리 중이거나 완료된 경우 스킵
        if (!kakaoSuccess || signupCompleted || isProcessing || signupAttempted.current) {
            return;
        }

        // user 상태가 이미 있으면 (이미 로그인된 상태) 완료 처리
        if (user) {
            console.log('[SignupSuccess] 이미 로그인된 상태:', user);
            setSignupCompleted(true);
            setUserId(user.id);
            localStorage.removeItem('pendingSignup');
            return;
        }

        // pendingSignup이 없으면 에러
        if (!pendingSignup) {
            // pendingSignup이 아직 로드되지 않았을 수 있으므로 대기
            return;
        }

        // 이메일 일치 확인
        if (emailFromQuery && pendingSignup.email !== emailFromQuery) {
            console.error('[SignupSuccess] 이메일 불일치:', pendingSignup.email, 'vs', emailFromQuery);
            alert('회원가입 정보가 일치하지 않습니다. 다시 시도해주세요.');
            localStorage.removeItem('pendingSignup');
            navigate('/auth', { replace: true });
            return;
        }

        // 회원가입 진행
        signupAttempted.current = true;
        setIsProcessing(true);
        console.log('[SignupSuccess] 카카오 인증 완료 - 회원가입 진행 시작');

        // pendingSignup 데이터로 회원가입 완료
        const signupData = {
            name: pendingSignup.name,
            email: pendingSignup.email,
            password: pendingSignup.password,
            jobRole: pendingSignup.jobRole,
            jobCategoryOther: pendingSignup.jobCategoryOther,
            cadence: pendingSignup.cadence,
            notificationKakao: true, // 카카오 인증 완료했으므로 true
            kakaoAuthCompleted: true, // 카카오 인증 완료 표시
        };

        signup(signupData)
            .then((result) => {
                console.log('[SignupSuccess] 회원가입 성공:', result);
                setSignupCompleted(true);
                setUserId(result?.userId || user?.id);
                localStorage.removeItem('pendingSignup');

                // 첫 인터뷰 질문 발송
                const newUserId = result?.userId || user?.id;
                if (newUserId) {
                    console.log('[SignupSuccess] 첫 인터뷰 질문 발송 시작');
                    fetch('/api/interviews/first', {
                        method: 'POST',
                        headers: {
                            'X-User-ID': newUserId,
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
            })
            .catch((error) => {
                console.error('[SignupSuccess] 회원가입 실패:', error);

                // 이미 가입된 사용자인 경우 로그인 시도
                if (error.message && error.message.includes('이미 존재')) {
                    console.log('[SignupSuccess] 이미 가입된 사용자 - 로그인 시도');
                    login({ email: pendingSignup.email, password: pendingSignup.password })
                        .then((userProfile) => {
                            console.log('[SignupSuccess] 로그인 성공:', userProfile);
                            setSignupCompleted(true);
                            setUserId(userProfile.id);
                            localStorage.removeItem('pendingSignup');
                        })
                        .catch((loginError) => {
                            console.error('[SignupSuccess] 로그인도 실패:', loginError);
                            alert('회원가입에 실패했습니다. 다시 시도해주세요.');
                            localStorage.removeItem('pendingSignup');
                            navigate('/auth', { replace: true });
                        });
                } else {
                    alert(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
                    localStorage.removeItem('pendingSignup');
                    navigate('/auth', { replace: true });
                }
            })
            .finally(() => {
                setIsProcessing(false);
            });
    }, [kakaoSuccess, user, signupCompleted, pendingSignup, signup, login, navigate, emailFromQuery, isProcessing]);

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
                    {isProcessing ? (
                        <>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                border: '4px solid #e9ecef',
                                borderTop: '4px solid #198754',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            <h2 style={{ marginTop: '1.5rem', fontSize: '1.4rem', color: '#198754' }}>
                                회원가입 진행 중...
                            </h2>
                            <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                                잠시만 기다려주세요.
                            </p>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon />
                            <h2 style={{ marginTop: '1.5rem', fontSize: '1.4rem', color: '#198754' }}>
                                {signupCompleted || (kakaoSuccess && user) ? '회원가입이 완료되었습니다!' : '카카오톡 인증 완료!'}
                            </h2>
                            <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                                {signupCompleted || (kakaoSuccess && user) ? 'PrePair에 오신 것을 환영합니다.' : '이제 회원가입을 완료해주세요.'}
                            </p>
                        </>
                    )}
                    
                    {/* 회원가입 완료 또는 카카오 인증 완료 */}
                    {(signupCompleted || (kakaoSuccess && user)) && (
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
                    
                    {!isProcessing && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                            <button
                                type="button"
                                onClick={goToMyPage}
                                className="cta-button cta-button--primary"
                            >
                                마이페이지로 가기
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.section>
        </div>
    );
}