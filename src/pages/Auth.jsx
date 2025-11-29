import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { jobData } from '../constants/onboarding'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'
import '../styles/pages/Auth.css'

const steps = [
    { id: 'account', label: '기본 정보' },
    { id: 'job', label: '직업/관심 선택' },
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
    const defaultJobCategory = jobData?.[0] || { id: 'service', roles: ['CS'] };

    const [mode, setMode] = useState('signup')
    const [activeStep, setActiveStep] = useState(0)
    const [loginForm, setLoginForm] = useState({ email: '', password: '' })

    const [signupForm, setSignupForm] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        jobCategory: defaultJobCategory.id,
        jobRole: defaultJobCategory.roles[0] || '',
        jobCategoryOther: '',
        cadence: defaultCadence,
        notificationKakao: false,
    })

    // 이메일 인증 관련 상태
    const [emailVerification, setEmailVerification] = useState({
        status: 'idle', // idle | sending | sent | verifying | verified | error
        errorMessage: '',
    })
    const [verificationCode, setVerificationCode] = useState('')

    useEffect(() => {
        const paramMode = searchParams.get('mode')
        if (paramMode && (paramMode === 'login' || paramMode === 'signup')) {
            setMode(paramMode)
        } else {
            setMode('signup')
        }
    }, [searchParams])

    const loginDisabled = !loginForm.email || !loginForm.password

    const passwordLengthValid = signupForm.password.length >= 6;
    const passwordSpecialCharValid = /[^A-Za-z0-9]/.test(signupForm.password);
    const passwordMatchValid = signupForm.password === signupForm.passwordConfirm;

    const signupStep1Disabled =
        !signupForm.name ||
        !signupForm.email ||
        !signupForm.password ||
        !signupForm.passwordConfirm ||
        !passwordLengthValid ||
        !passwordSpecialCharValid ||
        !passwordMatchValid;

    const handleLogin = (event) => {
        event.preventDefault()
        if (loginDisabled) return

        login(loginForm.email, loginForm.password)
        navigate(redirectFrom || '/rewards', { replace: true })
    }

    const handleSignup = (event) => {
        event.preventDefault()

        if (signupForm.jobCategory === 'other' && !signupForm.jobCategoryOther) {
            alert('기타 직군을 입력해주세요.');
            return;
        }

        signup(signupForm)
        navigate('/signup-success', { replace: true })
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
            // 실제 API 엔드포인트에 맞게 URL을 수정해서 사용하시면 됩니다.
            const response = await fetch('/api/auth/email/verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: signupForm.email }),
            })

            if (!response.ok) {
                throw new Error('failed to send code')
            }

            setEmailVerification({
                status: 'sent',
                errorMessage: '',
            })
            alert('인증 코드가 입력하신 이메일로 발송되었습니다.')
        } catch (error) {
            console.error(error)
            setEmailVerification({
                status: 'error',
                errorMessage: '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
            })
        }
    }

    // 이메일 인증 코드 검증
    const handleVerifyEmailCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            alert('이메일로 받은 6자리 인증 코드를 입력해주세요.')
            return
        }

        setEmailVerification((prev) => ({
            ...prev,
            status: 'verifying',
            errorMessage: '',
        }))

        try {
            // 실제 API 엔드포인트에 맞게 URL을 수정해서 사용하시면 됩니다.
            const response = await fetch('/api/auth/email/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: signupForm.email,
                    code: verificationCode,
                }),
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok || !data?.success) {
                throw new Error('invalid code')
            }

            setEmailVerification({
                status: 'verified',
                errorMessage: '',
            })
            alert('이메일 인증이 완료되었습니다.')
        } catch (error) {
            console.error(error)
            setEmailVerification({
                status: 'error',
                errorMessage: '인증 코드가 올바르지 않습니다. 다시 확인해주세요.',
            })
        }
    }

    const selectedJobCategory = jobData.find(j => j.id === signupForm.jobCategory);
    // 선택한 직군이 '기타'가 아닌 경우, 세부 직무 옵션에서 '기타' 항목은 숨김
    const selectedJobRoles = selectedJobCategory
        ? selectedJobCategory.roles.filter((role) =>
            selectedJobCategory.id === 'other' ? true : role !== '기타'
        )
        : [];

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
                                                    setVerificationCode('')
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
                                                    emailVerification.status === 'verified'
                                                }
                                            >
                                                {emailVerification.status === 'sending'
                                                    ? '발송 중...'
                                                    : emailVerification.status === 'sent'
                                                        ? '재전송'
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
                                                <span>인증 코드</span>
                                                <div className="auth__email-code-row">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                        className="auth__email-code-input"
                                        
                                                        value={verificationCode}
                                                        onChange={(event) => {
                                                            const onlyNumber = event.target.value.replace(/[^0-9]/g, '')
                                                            setVerificationCode(onlyNumber)
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="auth__email-verify-button auth__email-verify-button--secondary"
                                                        onClick={handleVerifyEmailCode}
                                                        disabled={
                                                            verificationCode.length !== 6 ||
                                                            emailVerification.status === 'verifying'
                                                        }
                                                    >
                                                        {emailVerification.status === 'verifying'
                                                            ? '확인 중...'
                                                            : '코드 확인'}
                                                    </button>
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
                                    <span>직군 (Job Category)</span>
                                    <select
                                        value={signupForm.jobCategory}
                                        onChange={(event) => {
                                            const newCategory = jobData.find(j => j.id === event.target.value);
                                            // 직군 변경 시에도 '기타' 직무는 기본값으로 선택되지 않도록 필터링
                                            const availableRoles = newCategory
                                                ? newCategory.roles.filter((role) =>
                                                    newCategory.id === 'other' ? true : role !== '기타'
                                                )
                                                : [];
                                            setSignupForm((prev) => ({
                                                ...prev,
                                                jobCategory: newCategory.id,
                                                jobRole: availableRoles[0] || ''
                                            }))
                                        }}
                                    >
                                        {jobData.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </label>

                                {selectedJobRoles.length > 0 && (
                                    <label className="form__field">
                                        <span>세부 직무 (Job Role)</span>
                                        <select
                                            value={signupForm.jobRole}
                                            onChange={(event) => setSignupForm((prev) => ({
                                                ...prev,
                                                jobRole: event.target.value
                                            }))}
                                        >
                                            {selectedJobRoles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {signupForm.jobCategory === 'other' && (
                                    <label className="form__field">
                                        <span>기타 직군 (직접 입력)</span>
                                        <input
                                            type="text"
                                            placeholder="직군을 입력하세요"
                                            value={signupForm.jobCategoryOther}
                                            onChange={(event) => setSignupForm((prev) => ({ ...prev, jobCategoryOther: event.target.value }))}
                                            required
                                        />
                                    </label>
                                )}

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
                                </div>


                                <div className="auth__summary-card">
                                    <p>
                                        <strong>{signupForm.cadence?.label}</strong>, <strong>{notificationSummary}</strong>(으)로
                                        <strong> {
                                            signupForm.jobCategory === 'other'
                                                ? signupForm.jobCategoryOther
                                                : signupForm.jobRole
                                        }</strong> ({selectedJobCategory?.label}) 역할에 대한
                                        AI 면접 질문을 보내드립니다.
                                    </p>
                                </div>

                                <div className="auth__actions">
                                    <button type="button" className="cta-button cta-button--ghost"
                                            onClick={() => setActiveStep(1)}>
                                        이전
                                    </button>
                                    <button type="submit" className="cta-button cta-button--primary">
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
                            <a className="auth__link" href="mailto:hello@prepair.ai">
                                비밀번호를 잊으셨나요?
                            </a>
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
            </section>
        </div>
    )
}
