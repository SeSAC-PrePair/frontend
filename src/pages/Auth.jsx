import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import '../styles/pages/Auth.css'

const steps = [
    { id: 'account', label: '기본 정보' },
    { id: 'job', label: '직업/관심 선택' },
    { id: 'cadence', label: '질문 주기 & 알림' },
]

const jobData = [
    { id: 'service', label: '서비스직', roles: ['CS', '승무원', '요식업', '기타'] },
    { id: 'public', label: '공무원 / 공공기관', roles: ['공무원', '공공기관', '기타'] },
    { id: 'development', label: '개발', roles: ['프론트엔드', '백엔드', 'AI', 'DevOps', '기타'] },
    { id: 'design', label: '디자인', roles: ['UX/UI', '그래픽', '영상', '기타'] },
    { id: 'marketing', label: '마케팅 / 기획', roles: ['마케팅', '기획', '광고', '기타'] },
    { id: 'finance', label: '금융 / 회계', roles: ['금융', '회계', '재무', '기타'] },
    { id: 'education', label: '교육 / 강사', roles: ['교육', '강사', '기타'] },
    { id: 'medical', label: '의료 / 간호 / 헬스케어', roles: ['의료', '간호', '헬스케어', '기타'] },
    { id: 'other', label: '기타 (직접 입력)', roles: [] }
];


export default function AuthPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()

    const { user, login, signup, jobTracks, cadencePresets } = useAppState()

    const redirectFrom = location.state?.from
    const redirectState = redirectFrom ? { from: redirectFrom } : undefined

    const defaultCadence = cadencePresets[0]
    const defaultJobCategory = jobData[0];

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

    const selectedJobCategory = jobData.find(j => j.id === signupForm.jobCategory);
    const selectedJobRoles = selectedJobCategory ? selectedJobCategory.roles : [];

    const notificationSummary = signupForm.notificationKakao
        ? '이메일 및 카카오톡'
        : '이메일';

    return (
        <div className="auth">
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
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={signupForm.email}
                                            onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                                            required
                                        />
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
                                            setSignupForm((prev) => ({
                                                ...prev,
                                                jobCategory: newCategory.id,
                                                jobRole: newCategory.roles[0] || ''
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
                    </form>
                )}
            </section>
        </div>
    )
}