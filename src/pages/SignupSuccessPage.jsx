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
    const { user, login } = useAppState();
    const [firstInterviewSent, setFirstInterviewSent] = useState(false);
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

    // 카카오 인증 완료 후 user 상태 확인 및 처리
    useEffect(() => {
        if (kakaoSuccess && !signupCompleted) {
            if (user) {
                // user 상태가 이미 설정되어 있으면 회원가입 완료로 처리
                // (이미 AppStateContext에서 signup 완료 후 setUser 호출됨)
                console.log('[SignupSuccess] 카카오 인증 완료 후 user 상태 확인:', user);
                setSignupCompleted(true);
                setUserId(user.id);
                localStorage.removeItem('pendingSignup'); // localStorage 정리
                
                // 첫 인터뷰 질문 발송
                console.log('[SignupSuccess] 첫 인터뷰 질문 발송 시작');
                fetch('/api/interviews/first', {
                    method: 'POST',
                    headers: {
                        'X-User-ID': user.id,
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
            } else if (pendingSignup && pendingSignup.email && pendingSignup.password) {
                // user가 없으면 pendingSignup의 정보로 로그인 시도
                // 주의: 이미 회원가입이 완료된 경우 로그인만 시도 (중복 회원가입 방지)
                console.log('[SignupSuccess] user 상태 없음 - 로그인 시도');
                login({ email: pendingSignup.email, password: pendingSignup.password })
                    .then((userProfile) => {
                        console.log('[SignupSuccess] 로그인 성공:', userProfile);
                        setSignupCompleted(true);
                        setUserId(userProfile.id);
                        localStorage.removeItem('pendingSignup'); // localStorage 정리
                        
                        // 첫 인터뷰 질문 발송
                        console.log('[SignupSuccess] 첫 인터뷰 질문 발송 시작');
                        fetch('/api/interviews/first', {
                            method: 'POST',
                            headers: {
                                'X-User-ID': userProfile.id,
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
                    })
                    .catch((error) => {
                        console.error('[SignupSuccess] 로그인 실패:', error);
                        // 로그인 실패 시 사용자에게 안내
                        alert('로그인에 실패했습니다. 다시 시도해주세요.');
                    });
            } else {
                // pendingSignup도 없으면 에러 처리
                console.error('[SignupSuccess] user도 pendingSignup도 없음 - 회원가입 정보를 찾을 수 없습니다.');
                alert('회원가입 정보를 찾을 수 없습니다. 다시 회원가입을 진행해주세요.');
                navigate('/auth', { replace: true });
            }
        }
    }, [kakaoSuccess, user, signupCompleted, pendingSignup, login, navigate]);

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
                    <CheckCircleIcon />
                    <h2 style={{ marginTop: '1.5rem', fontSize: '1.4rem', color: '#198754' }}>
                        {signupCompleted || (kakaoSuccess && user) ? '회원가입이 완료되었습니다!' : '카카오톡 인증 완료!'}
                    </h2>
                    <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                        {signupCompleted || (kakaoSuccess && user) ? 'PrePair에 오신 것을 환영합니다.' : '이제 회원가입을 완료해주세요.'}
                    </p>
                    
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
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                        <button
                            type="button"
                            onClick={goToMyPage}
                            className="cta-button cta-button--primary"
                        >
                            마이페이지로 가기
                        </button>
                    </div>
                </motion.div>
            </motion.section>
        </div>
    );
}