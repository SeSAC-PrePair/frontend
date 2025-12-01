import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { resetPassword } from '../utils/authApi'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'
import '../styles/pages/Auth.css'

const steps = [
    { id: 'account', label: '기본 정보' },
    { id: 'job', label: '목표 직무' },
    // 모바일에서 줄 바꿈이 일어나지 않도록 조금 더 짧은 라벨 사용
    { id: 'cadence', label: '질문/알림' },
]


export default function AuthPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()

    const { user, login, signup, jobTracks, cadencePresets } = useAppState()

    const redirectFrom = location.state?.from
    const redirectState = redirectFrom ? { from: redirectFrom } : undefined

    const defaultCadence = cadencePresets?.[0] || null

    const [mode, setMode] = useState('signup')
    const [activeStep, setActiveStep] = useState(0)
    const [loginForm, setLoginForm] = useState({ email: '', password: '' })

    // 비밀번호 찾기 관련 상태
    const [showPasswordReset, setShowPasswordReset] = useState(false)
    const [passwordResetForm, setPasswordResetForm] = useState({ email: '', password: '', passwordConfirm: '' })
    const [passwordResetStatus, setPasswordResetStatus] = useState({ loading: false, error: '' })

    const [signupForm, setSignupForm] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        jobCategory: '',
        jobRole: '',
        cadence: defaultCadence,
        notificationKakao: false,
    })

    // 회원가입 및 질문 전송 로딩 상태
    const [isSigningUp, setIsSigningUp] = useState(false)

    // 이메일 인증 관련 상태
    const [emailVerification, setEmailVerification] = useState({
        status: 'idle', // idle | sending | sent | verifying | verified | error
        errorMessage: '',
    })
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']) // 6자리 인증번호
    const [timeRemaining, setTimeRemaining] = useState(0) // 남은 시간 (초)
    const timerRef = useRef(null)

    useEffect(() => {
        const paramMode = searchParams.get('mode')
        if (paramMode && (paramMode === 'login' || paramMode === 'signup')) {
            setMode(paramMode)
        } else {
            setMode('signup')
        }
    }, [searchParams])

    // 타이머 관리
    useEffect(() => {
        if (timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining((prev) => prev - 1)
            }, 1000)
        } else if (timeRemaining === 0 && timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [timeRemaining])

    const loginDisabled = !loginForm.email || !loginForm.password

    const passwordLengthValid = signupForm.password.length >= 6;
    const passwordSpecialCharValid = /[^A-Za-z0-9]/.test(signupForm.password);
    const passwordMatchValid = signupForm.password === signupForm.passwordConfirm;

    // 비밀번호 찾기 폼 유효성 검사
    const resetPasswordLengthValid = passwordResetForm.password.length >= 6;
    const resetPasswordSpecialCharValid = /[^A-Za-z0-9]/.test(passwordResetForm.password);
    const resetPasswordMatchValid = passwordResetForm.password === passwordResetForm.passwordConfirm;
    const resetPasswordFormValid =
        passwordResetForm.email &&
        passwordResetForm.password &&
        passwordResetForm.passwordConfirm &&
        resetPasswordLengthValid &&
        resetPasswordSpecialCharValid &&
        resetPasswordMatchValid;

    const signupStep1Disabled =
        !signupForm.name ||
        !signupForm.email ||
        !signupForm.password ||
        !signupForm.passwordConfirm ||
        !passwordLengthValid ||
        !passwordSpecialCharValid ||
        !passwordMatchValid;

    const handleLogin = async (event) => {
        event.preventDefault()
        if (loginDisabled) return

        try {
            await login({
                email: loginForm.email,
                password: loginForm.password,
            })
            navigate(redirectFrom || '/rewards', { replace: true })
        } catch (error) {
            alert(error.message || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
        }
    }

    // 비밀번호 찾기 처리
    const handlePasswordReset = async (event) => {
        event.preventDefault()
        if (!resetPasswordFormValid) return

        setPasswordResetStatus({ loading: true, error: '' })

        try {
            await resetPassword(passwordResetForm.email, passwordResetForm.password)
            alert('비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.')
            setShowPasswordReset(false)
            setPasswordResetForm({ email: '', password: '', passwordConfirm: '' })
            setPasswordResetStatus({ loading: false, error: '' })
        } catch (error) {
            console.error('[Auth] Password reset error:', error)
            setPasswordResetStatus({
                loading: false,
                error: error.message || '비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해주세요.'
            })
        }
    }

    const handleSignup = async (event) => {
        event.preventDefault()

        if (!signupForm.jobRole || !signupForm.jobRole.trim()) {
            alert('목표 직무를 입력해주세요.');
            return;
        }

        setIsSigningUp(true)

        try {
            const result = await signup(signupForm)

            // 카카오 알림이 설정되어 있고 userId가 있으면 바로 카카오 인증 API 호출
            if (signupForm.notificationKakao && result?.userId) {
                console.log('[Auth] 카카오 알림 설정됨, 카카오 인증 API 호출:', {
                    userId: result.userId,
                    url: `/api/auth/kakao?user_id=${encodeURIComponent(result.userId)}`
                })

                // 카카오 인증 페이지로 리다이렉트
                window.location.href = `/api/auth/kakao?user_id=${encodeURIComponent(result.userId)}`
                return
            }

            // 카카오 알림이 설정되지 않은 경우 회원가입 성공 페이지로 이동
            navigate('/signup-success', {
                replace: true,
                state: {
                    needsKakaoAuth: false,
                    userId: result?.userId
                }
            })
        } catch (error) {
            console.error('[Auth] Signup error:', error)
            const errorMessage = error.message || '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
            alert(errorMessage)
            setIsSigningUp(false)
        }
    }

    // 이메일 인증 메일 발송
    const handleSendVerificationEmail = async () => {
        if (!signupForm.email) {
            alert('이메일을 먼저 입력해주세요.')
            return
        }

        setEmailVerification((prev) => ({
            ...prev,
            status: 'sending',
            errorMessage: '',
        }))

        try {
            const response = await fetch('/api/auth/email/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: signupForm.email }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                if (response.status === 400) {
                    throw new Error(errorData.message || '이메일은 필수 입력 항목입니다.')
                } else if (response.status === 404) {
                    throw new Error('존재하지 않는 이메일입니다.')
                } else {
                    throw new Error(errorData.message || '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.')
                }
            }

            setEmailVerification({
                status: 'sent',
                errorMessage: '',
            })
            setTimeRemaining(300) // 5분 = 300초
            alert('인증 코드가 입력하신 이메일로 발송되었습니다.')
        } catch (error) {
            console.error(error)
            setEmailVerification({
                status: 'error',
                errorMessage: error.message || '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
            })
        }
    }

    // 재요청 핸들러
    const handleResendVerificationEmail = async () => {
        await handleSendVerificationEmail()
    }

    // 이메일 인증 코드 검증
    const handleVerifyEmailCode = async () => {
        const codeString = verificationCode.join('')
        if (!codeString || codeString.length !== 6) {
            alert('이메일로 받은 6자리 인증 코드를 입력해주세요.')
            return
        }

        setEmailVerification((prev) => ({
            ...prev,
            status: 'verifying',
            errorMessage: '',
        }))

        try {
            // 엔드포인트를 /api/auth/email/verify로 수정
            const response = await fetch('/api/auth/email/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: signupForm.email,
                    code: verificationCode.join(''),
                }),
            })

            // 응답 처리 - API 스펙에 따라 200이면 성공, 400이면 에러
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                if (response.status === 400) {
                    throw new Error(errorData.message || '유효하지 않은 인증 코드입니다.')
                } else {
                    throw new Error(errorData.message || '인증 확인 중 오류가 발생했습니다.')
                }
            }

            // 성공 시 (200 OK)
            setEmailVerification({
                status: 'verified',
                errorMessage: '',
            })
            setTimeRemaining(0)
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            alert('이메일 인증이 완료되었습니다.')
        } catch (error) {
            console.error('이메일 인증 오류:', error)
            setEmailVerification({
                status: 'error',
                errorMessage: error.message || '인증 코드가 올바르지 않습니다. 다시 확인해주세요.',
            })
        }
    }

    const notificationSummary = signupForm.notificationKakao
        ? '이메일 및 카카오톡'
        : '이메일';

    // 로봇 눈 마우스 트래킹
    const robotRef = useRef(null)
    const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
    const [isTyping, setIsTyping] = useState(false)
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!robotRef.current) return

            const robotRect = robotRef.current.getBoundingClientRect()
            const robotCenterX = robotRect.left + robotRect.width / 2
            const robotCenterY = robotRect.top + robotRect.height * 0.35 // 눈 위치 기준

            const deltaX = event.clientX - robotCenterX
            const deltaY = event.clientY - robotCenterY

            // 눈 이동 범위 제한 (위쪽은 적게, 아래쪽은 많이)
            const offsetX = Math.max(-8, Math.min(8, deltaX / 40))
            const offsetY = deltaY < 0
                ? Math.max(0, deltaY / 100)   // 위쪽: 최대 -3px, 둔감하게
                : Math.min(15, deltaY / 20)   // 아래쪽: 최대 12px, 민감하게

            setEyeOffset({ x: offsetX, y: offsetY })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // 키보드 입력 감지
    useEffect(() => {
        const handleKeyDown = (event) => {
            // 입력 필드에서만 반응하도록 체크
            const tagName = event.target.tagName.toLowerCase()
            if (tagName === 'input' || tagName === 'textarea') {
                setIsTyping(true)

                // 이전 타이머 클리어
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current)
                }

                // 500ms 후 원래 눈으로 복구
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false)
                }, 500)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        }
    }, [])

    return (
        <div className="auth">
            {/* 회원가입 로딩 오버레이 */}
            {isSigningUp && (
                <div className="auth__loading-overlay">
                    <div className="auth__loading-content">
                        <div className="auth__loading-robot">
                            <img src={robotLogo} alt="PrePair 로봇" />
                        </div>
                        <div className="auth__loading-spinner"></div>
                        <p className="auth__loading-text">질문을 준비하고 있어요...</p>
                    </div>
                </div>
            )}
            
            {/* 로봇 마스코트 */}
            <div className="auth__robot-section">
                <div className="auth__robot" ref={robotRef}>
                    <img src={robotLogo} alt="PrePair 로봇" />
                    {/* 눈 영역 마스크 (검은색으로 기존 눈 가림) */}
                    <div className="auth__robot-face-mask" />
                    {/* 커스텀 눈 */}
                    <div className="auth__robot-eyes">
                        {/* 일반 눈 */}
                        <div
                            className="auth__robot-eye auth__robot-eye--left"
                            style={{
                                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                                opacity: isTyping ? 0 : 1
                            }}
                        />
                        <div
                            className="auth__robot-eye auth__robot-eye--right"
                            style={{
                                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                                opacity: isTyping ? 0 : 1
                            }}
                        />
                        {/* 행복한 눈 (^ ^) */}
                        <div
                            className="auth__robot-eye--happy"
                            style={{ opacity: isTyping ? 1 : 0 }}
                        >^</div>
                        <div
                            className="auth__robot-eye--happy"
                            style={{ opacity: isTyping ? 1 : 0 }}
                        >^</div>
                    </div>
                </div>
                <div className="auth__robot-text">
                    <h1>PrePair</h1>
                    <p>AI와 함께하는 면접 준비</p>
                </div>
            </div>

            <section className="auth__form">
                <header>
                    <h2>{mode === 'signup' ? '회원가입' : '로그인'}</h2>
                </header>

                {mode === 'signup' ? (
                    <form onSubmit={handleSignup}>
                        <div className="form__stepper">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`stepper__item ${index === activeStep ? 'is-active' : ''}`}
                                >
                                    <strong>{step.label}</strong>
                                    <span />
                                </div>
                            ))}
                        </div>

                        {activeStep === 0 && (
                            <>
                                <div className="form__grid">
                                    <label className="form__field">
                                        <span>이름</span>
                                        <input
                                            type="text"
                                            placeholder="홍길동"
                                            value={signupForm.name}
                                            onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
                                            required
                                        />
                                    </label>
                                    <label className="form__field">
                                        <span>이메일</span>
                                        <div className="auth__email-row">
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={signupForm.email}
                                                onChange={(event) => {
                                                    const nextEmail = event.target.value
                                                    setSignupForm((prev) => ({ ...prev, email: nextEmail }))
                                                    // 이메일이 변경되면 인증 상태 초기화
                                                    setEmailVerification({
                                                        status: 'idle',
                                                        errorMessage: '',
                                                    })
                                                    setVerificationCode(['', '', '', '', '', ''])
                                                    setTimeRemaining(0)
                                                    if (timerRef.current) {
                                                        clearTimeout(timerRef.current)
                                                        timerRef.current = null
                                                    }
                                                }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="auth__email-verify-button"
                                                onClick={handleSendVerificationEmail}
                                                disabled={
                                                    !signupForm.email ||
                                                    emailVerification.status === 'sending' ||
                                                    emailVerification.status === 'verifying' ||
                                                    emailVerification.status === 'sent' ||
                                                    emailVerification.status === 'verified'
                                                }
                                            >
                                                {emailVerification.status === 'sending'
                                                    ? '발송 중...'
                                                    : emailVerification.status === 'verified'
                                                        ? '인증 완료'
                                                        : '인증 메일 보내기'}
                                            </button>
                                        </div>

                                        {/* 인증 코드 입력 영역 */}
                                        {(emailVerification.status === 'sent' ||
                                            emailVerification.status === 'verifying' ||
                                            emailVerification.status === 'error') && (
                                            <div className="auth__email-code">
                                                <div className="auth__email-code-header">
                                                    <span>인증 코드</span>
                                                    {timeRemaining > 0 && (
                                                        <span className="auth__email-timer">
                                                            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="auth__email-code-row">
                                                    <div className="auth__email-code-inputs">
                                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                                            <input
                                                                key={index}
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={1}
                                                                className="auth__email-code-input-single"
                                                                value={verificationCode[index] || ''}
                                                                onChange={(event) => {
                                                                    const value = event.target.value.replace(/[^0-9]/g, '')
                                                                    if (value.length <= 1) {
                                                                        const newCode = [...verificationCode]
                                                                        newCode[index] = value
                                                                        setVerificationCode(newCode)

                                                                        // 자동으로 다음 input으로 포커스 이동
                                                                        if (value && index < 5) {
                                                                            const nextInput = event.target.parentElement.children[index + 1]
                                                                            if (nextInput) nextInput.focus()
                                                                        }
                                                                    }
                                                                }}
                                                                onKeyDown={(event) => {
                                                                    // 백스페이스 키 처리
                                                                    if (event.key === 'Backspace' && !verificationCode[index] && index > 0) {
                                                                        const prevInput = event.target.parentElement.children[index - 1]
                                                                        if (prevInput) prevInput.focus()
                                                                    }
                                                                }}
                                                                onPaste={(event) => {
                                                                    event.preventDefault()
                                                                    const pastedData = event.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
                                                                    const newCode = [...verificationCode]
                                                                    for (let i = 0; i < 6; i++) {
                                                                        newCode[i] = pastedData[i] || ''
                                                                    }
                                                                    setVerificationCode(newCode)
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="auth__email-code-actions">
                                                        <button
                                                            type="button"
                                                            className="auth__email-verify-button auth__email-verify-button--secondary"
                                                            onClick={handleVerifyEmailCode}
                                                            disabled={
                                                                verificationCode.join('').length !== 6 ||
                                                                emailVerification.status === 'verifying'
                                                            }
                                                        >
                                                            {emailVerification.status === 'verifying'
                                                                ? '확인 중...'
                                                                : '코드 확인'}
                                                        </button>
                                                        {timeRemaining > 0 && (
                                                            <button
                                                                type="button"
                                                                className="auth__email-resend-button"
                                                                onClick={handleResendVerificationEmail}
                                                                disabled={emailVerification.status === 'sending'}
                                                            >
                                                                {emailVerification.status === 'sending' ? '재요청 중...' : '재요청'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 상태 메시지 */}
                                        {emailVerification.status === 'verified' && (
                                            <p className="auth__hint auth__hint--good">
                                                해당 이메일로 인증이 완료되었습니다. 계속 진행하실 수 있어요.
                                            </p>
                                        )}
                                        {emailVerification.status === 'error' && emailVerification.errorMessage && (
                                            <p className="auth__hint">
                                                {emailVerification.errorMessage}
                                            </p>
                                        )}
                                    </label>
                                </div>
                                <div className="form__grid">
                                    <label className="form__field">
                                        <span>비밀번호</span>
                                        <input
                                            type="password"
                                            placeholder="비밀번호 (6자 이상, 특수문자 1개 포함)"
                                            value={signupForm.password}
                                            onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                                            required
                                        />
                                    </label>
                                    <label className="form__field">
                                        <span>비밀번호 확인</span>
                                        <input
                                            type="password"
                                            placeholder="비밀번호 확인"
                                            value={signupForm.passwordConfirm}
                                            onChange={(event) => setSignupForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))}
                                            required
                                        />
                                    </label>
                                </div>

                                {(signupForm.password.length > 0 && !passwordLengthValid) && (
                                    <p className="auth__hint">
                                        비밀번호는 6자 이상이어야 합니다.
                                    </p>
                                )}
                                {(signupForm.password.length > 0 && !passwordSpecialCharValid) && (
                                    <p className="auth__hint">
                                        비밀번호는 특수문자를 1개 이상 포함해야 합니다. (예: !, @, #)
                                    </p>
                                )}
                                {(signupForm.passwordConfirm.length > 0 && !passwordMatchValid) && (
                                    <p className="auth__hint">
                                        비밀번호가 일치하지 않습니다.
                                    </p>
                                )}


                                <div className="auth__actions">
                                    <button type="button" className="cta-button cta-button--primary"
                                            onClick={() => setActiveStep(1)} disabled={signupStep1Disabled}>
                                        다음
                                    </button>
                                </div>
                            </>
                        )}

                        {activeStep === 1 && (
                            <>
                                <label className="form__field">
                                    <span>목표 직무</span>
                                    <input
                                        type="text"
                                        placeholder="목표 직무를 입력하세요 (예: 프론트엔드 개발자, 마케팅 매니저 등)"
                                        value={signupForm.jobRole}
                                        onChange={(event) => setSignupForm((prev) => ({
                                            ...prev,
                                            jobRole: event.target.value
                                        }))}
                                        required
                                    />
                                </label>

                                <div className="auth__actions">
                                    <button type="button" className="cta-button cta-button--ghost"
                                            onClick={() => setActiveStep(0)}>
                                        이전
                                    </button>
                                    <button type="button" className="cta-button cta-button--primary"
                                            onClick={() => setActiveStep(2)}>
                                        다음
                                    </button>
                                </div>
                            </>
                        )}

                        {activeStep === 2 && (
                            <>
                                <label className="form__field">
                                    <span>질문 주기</span>
                                    <select
                                        value={signupForm.cadence?.id}
                                        onChange={(event) => setSignupForm((prev) => ({
                                            ...prev,
                                            cadence: cadencePresets.find(c => c.id === event.target.value)
                                        }))}
                                    >
                                        {cadencePresets.map((preset) => (
                                            <option key={preset.id} value={preset.id}>{preset.label}</option>
                                        ))}
                                    </select>
                                </label>

                                <div className="form__field">
                                    <span>알림 채널</span>
                                    {/* [MODIFIED] 알림 안내 텍스트 스타일 변경 */}
                                    <p className="auth__notification-info">
                                        <span role="img" aria-label="info icon" style={{ marginRight: '5px' }}>📧</span>
                                        이메일 알림은 기본으로 제공됩니다.
                                    </p>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 0' }}>
                                        <input
                                            type="checkbox"
                                            id="kakao-toggle"
                                            checked={signupForm.notificationKakao}
                                            onChange={(event) => setSignupForm((prev) => ({
                                                ...prev,
                                                notificationKakao: event.target.checked
                                            }))}
                                        />
                                        <span style={{ margin: 0, fontWeight: 'normal', fontSize: '15px' }}>
                                            카카오톡으로도 알림 받기 (선택)
                                        </span>
                                    </label>
                                    {/* 카카오 알림 설정 시 안내 문구 */}
                                    {signupForm.notificationKakao && (
                                        <p className="auth__hint auth__hint--info" style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                                            <span role="img" aria-label="info icon" style={{ marginRight: '4px' }}>ℹ️</span>
                                            카카오톡 알림을 사용하시려면 회원가입 후 카카오 인증이 필요합니다.
                                        </p>
                                    )}
                                </div>


                                <div className="auth__summary-card">
                                    <p>
                                        <strong>{signupForm.cadence?.label}</strong>, <strong>{notificationSummary}</strong>(으)로
                                        <strong> {signupForm.jobRole}</strong> 역할에 대한
                                        AI 면접 질문을 보내드립니다.
                                    </p>
                                </div>

                                <div className="auth__actions">
                                    <button type="button" className="cta-button cta-button--ghost"
                                            onClick={() => setActiveStep(1)}>
                                        이전
                                    </button>
                                    <button
                                        type="submit"
                                        className="cta-button cta-button--primary"
                                    >
                                        회원가입 완료
                                    </button>
                                </div>
                            </>
                        )}

                        <p className="auth__mode-switch">
                            이미 계정이 있으신가요?
                            <button
                                type="button"
                                className="auth__link"
                                onClick={() => setMode('login')}
                            >
                                로그인
                            </button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleLogin}>
                        <label className="form__field">
                            <span>이메일</span>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={loginForm.email}
                                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                                required
                            />
                        </label>

                        <label className="form__field">
                            <span>비밀번호</span>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={loginForm.password}
                                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                                required
                            />
                            <button
                                type="button"
                                className="auth__link"
                                onClick={() => {
                                    setShowPasswordReset(true)
                                    setPasswordResetForm((prev) => ({ ...prev, email: loginForm.email }))
                                }}
                                style={{ textAlign: 'left', padding: 0, margin: 0 }}
                            >
                                비밀번호를 잊으셨나요?
                            </button>
                        </label>

                        <button type="submit" className="cta-button cta-button--primary" disabled={loginDisabled}>
                            로그인
                        </button>

                        <p className="auth__mode-switch">
                            계정이 없으신가요?
                            <button
                                type="button"
                                className="auth__link"
                                onClick={() => setMode('signup')}
                            >
                                회원가입
                            </button>
                        </p>
                    </form>
                )}

                {/* 비밀번호 찾기 모달 */}
                {showPasswordReset && (
                    <div className="auth__password-reset-modal">
                        <div className="auth__password-reset-content">
                            <div className="auth__password-reset-header">
                                <h3>비밀번호 재설정</h3>
                                <button
                                    type="button"
                                    className="auth__password-reset-close"
                                    onClick={() => {
                                        setShowPasswordReset(false)
                                        setPasswordResetForm({ email: '', password: '', passwordConfirm: '' })
                                        setPasswordResetStatus({ loading: false, error: '' })
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handlePasswordReset}>
                                <label className="form__field">
                                    <span>이메일</span>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={passwordResetForm.email}
                                        onChange={(event) => setPasswordResetForm((prev) => ({ ...prev, email: event.target.value }))}
                                        required
                                        disabled={passwordResetStatus.loading}
                                    />
                                </label>

                                <label className="form__field">
                                    <span>새 비밀번호</span>
                                    <input
                                        type="password"
                                        placeholder="비밀번호 (6자 이상, 특수문자 1개 포함)"
                                        value={passwordResetForm.password}
                                        onChange={(event) => setPasswordResetForm((prev) => ({ ...prev, password: event.target.value }))}
                                        required
                                        disabled={passwordResetStatus.loading}
                                    />
                                </label>

                                {(passwordResetForm.password.length > 0 && !resetPasswordLengthValid) && (
                                    <p className="auth__hint">
                                        비밀번호는 6자 이상이어야 합니다.
                                    </p>
                                )}
                                {(passwordResetForm.password.length > 0 && !resetPasswordSpecialCharValid) && (
                                    <p className="auth__hint">
                                        비밀번호는 특수문자를 1개 이상 포함해야 합니다. (예: !, @, #)
                                    </p>
                                )}

                                <label className="form__field">
                                    <span>새 비밀번호 확인</span>
                                    <input
                                        type="password"
                                        placeholder="비밀번호 확인"
                                        value={passwordResetForm.passwordConfirm}
                                        onChange={(event) => setPasswordResetForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))}
                                        required
                                        disabled={passwordResetStatus.loading}
                                    />
                                </label>

                                {(passwordResetForm.passwordConfirm.length > 0 && !resetPasswordMatchValid) && (
                                    <p className="auth__hint">
                                        비밀번호가 일치하지 않습니다.
                                    </p>
                                )}

                                {passwordResetStatus.error && (
                                    <p className="auth__hint">
                                        {passwordResetStatus.error}
                                    </p>
                                )}

                                <div className="auth__actions">
                                    <button
                                        type="button"
                                        className="cta-button cta-button--ghost"
                                        onClick={() => {
                                            setShowPasswordReset(false)
                                            setPasswordResetForm({ email: '', password: '', passwordConfirm: '' })
                                            setPasswordResetStatus({ loading: false, error: '' })
                                        }}
                                        disabled={passwordResetStatus.loading}
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        className="cta-button cta-button--primary"
                                        disabled={!resetPasswordFormValid || passwordResetStatus.loading}
                                    >
                                        {passwordResetStatus.loading ? '처리 중...' : '비밀번호 재설정'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
