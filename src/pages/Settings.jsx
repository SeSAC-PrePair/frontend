import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import {jobData} from '../constants/onboarding'
import '../styles/pages/Settings.css'

const focusAreas = [
    {
        id: 'product-strategy',
        label: '프로덕트 전략',
        description: '시장 리서치, 로드맵 수립, KPI 설계에 집중하고 싶어요.',
    },
    {
        id: 'growth-data',
        label: '그로스 · 데이터',
        description: '데이터 기반 실험, 퍼널 진단, 인사이트 발굴이 목표예요.',
    },
    {
        id: 'leadership',
        label: '리더십 · 협업',
        description: '조직 운영, 팀 커뮤니케이션 역량을 기르고 싶어요.',
    },
    {
        id: 'communication',
        label: '커뮤니케이션 · 스토리',
        description: '설득력 있는 발표, 글쓰기, 스토리텔링을 연습하고 싶어요.',
    },
]


export default function SettingsPage() {
    const {user, updateSettings, deleteAccount, cadencePresets, notificationChannelPresets} = useAppState()
    const navigate = useNavigate()
    const defaultJobCategory = jobData[0]
    const fallbackJobCategoryId = user?.jobTrackId === 'other' ? 'other' : (user?.jobTrackId ?? defaultJobCategory.id)
    const fallbackJobCategory = fallbackJobCategoryId === 'other' ? null : jobData.find((cat) => cat.id === fallbackJobCategoryId) ?? defaultJobCategory
    // 사용자의 jobRoleLabel을 찾거나 기본값 사용
    const fallbackJobRole = user?.jobRoleLabel ?? (fallbackJobCategory ? fallbackJobCategory.roles[0] : '')
    const focusMatch = focusAreas.find((area) => area.label === user?.focusArea)
    const fallbackFocusAreaId = focusMatch?.id ?? focusAreas[0]?.id ?? ''

    const [form, setForm] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
        jobCategory: fallbackJobCategoryId,
        jobRole: fallbackJobRole,
        focusAreaId: fallbackFocusAreaId,
        questionCadence: user?.questionCadence ?? 'daily',
        notificationChannels: user?.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
        jobCategoryOther: user?.customJobLabel ?? '',
    })
    const [status, setStatus] = useState('')
    const selectedJobCategory = jobData.find((cat) => cat.id === form.jobCategory) ?? defaultJobCategory
    // 선택한 직군이 '기타'가 아닌 경우, 세부 직무 옵션에서 '기타' 항목은 숨김
    const selectedJobRoles = selectedJobCategory
        ? selectedJobCategory.roles.filter((role) =>
            selectedJobCategory.id === 'other' ? true : role !== '기타'
        )
        : []

    useEffect(() => {
        if (!user) return
        const nextJobCategoryId = user.jobTrackId === 'other' ? 'other' : (user.jobTrackId ?? defaultJobCategory.id)
        const nextJobCategory = nextJobCategoryId === 'other' ? null : jobData.find((cat) => cat.id === nextJobCategoryId) ?? defaultJobCategory
        const nextJobRole = user.jobRoleLabel ?? (nextJobCategory ? nextJobCategory.roles[0] : '')
        const nextFocusAreaId =
            focusAreas.find((area) => area.label === user.focusArea)?.id ?? focusAreas[0]?.id ?? ''

        setForm({
            name: user.name ?? '',
            email: user.email ?? '',
            jobCategory: nextJobCategoryId,
            jobRole: nextJobRole,
            focusAreaId: nextFocusAreaId,
            questionCadence: user.questionCadence ?? 'daily',
            notificationChannels: user.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
            jobCategoryOther: user.customJobLabel ?? '',
        })
    }, [user])

    const handleJobCategorySelect = (categoryId) => {
        setForm((prev) => {
            if (prev.jobCategory === categoryId) return prev
            const nextCategory = jobData.find((cat) => cat.id === categoryId)
            // 직군 변경 시에도 '기타' 직무는 기본값으로 선택되지 않도록 필터링
            const availableRoles = nextCategory
                ? nextCategory.roles.filter((role) =>
                    nextCategory.id === 'other' ? true : role !== '기타'
                )
                : []
            return {
                ...prev,
                jobCategory: categoryId,
                jobRole: availableRoles[0] || '',
                jobCategoryOther: categoryId === 'other' ? prev.jobCategoryOther : '',
            }
        })
    }

    const handleJobRoleSelect = (role) => {
        setForm((prev) => ({...prev, jobRole: role}))
    }

    const handleFocusSelect = (focusId) => {
        setForm((prev) => ({...prev, focusAreaId: focusId}))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const cadenceMeta = cadencePresets.find((item) => item.id === form.questionCadence)
        const categoryMeta = jobData.find((cat) => cat.id === form.jobCategory)
        const focusMeta = focusAreas.find((area) => area.id === form.focusAreaId)
        const isOther = form.jobCategory === 'other'
        updateSettings({
            jobTrackId: isOther ? 'other' : (categoryMeta?.id ?? ''),
            jobTrackLabel: isOther ? form.jobCategoryOther : (categoryMeta?.label ?? ''),
            jobRoleId: isOther ? '' : '',
            jobRoleLabel: isOther ? '' : (form.jobRole ?? ''),
            desiredField: isOther ? form.jobCategoryOther : (form.jobRole ?? categoryMeta?.label ?? user?.desiredField ?? ''),
            focusArea: focusMeta?.label ?? '',
            questionCadence: form.questionCadence,
            questionCadenceLabel: cadenceMeta?.label,
            questionSchedule: cadenceMeta?.schedule,
            notificationChannels: ['email', ...form.notificationChannels],
            customJobLabel: isOther ? form.jobCategoryOther : '',
        })
        setStatus('저장되었습니다!')
        setTimeout(() => setStatus(''), 2400)
    }

    const toggleChannel = (channelId) => {
        setForm((prev) => {
            if (prev.notificationChannels.includes(channelId)) {
                return {
                    ...prev,
                    notificationChannels: prev.notificationChannels.filter((id) => id !== channelId),
                }
            }
            return {...prev, notificationChannels: [...prev.notificationChannels, channelId]}
        })
    }

    const handleDeleteAccount = () => {
        const confirmed = window.confirm(
            '정말 회원 탈퇴를 하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.'
        )
        if (confirmed) {
            deleteAccount()
            navigate('/', {replace: true})
        }
    }

    return (
        <div className="settings">
            <header className="settings__header">
                <div>
                    <h1>개인 설정</h1>
                
                </div>
            
            </header>

            <form className="settings__form" onSubmit={handleSubmit}>
                <fieldset>
                    <b>개인 정보</b>
                    <div className="settings__goal-section">
                        <div className="settings__group">
                            <p id="settings-name-label" className="settings__subhead">
                                이름
                            </p>
                            <div className="settings__field">
                                <input
                                    type="text"
                                    id="settings-name"
                                    className="settings__select"
                                    aria-labelledby="settings-name-label"
                                    placeholder="이름을 입력해주세요"
                                    value={form.name}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="settings__group">
                            <p id="settings-email-label" className="settings__subhead">
                                이메일
                            </p>
                            <div className="settings__field">
                                <input
                                    type="email"
                                    id="settings-email"
                                    className="settings__select"
                                    aria-labelledby="settings-email-label"
                                    placeholder="이메일을 입력해주세요"
                                    value={form.email}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <b>목표 직무 · 관심 분야</b>
                    <div className="settings__goal-section">
                        <div className="settings__group">
                            <p id="settings-job-track-label" className="settings__subhead">
                                직군 (Job Category)
                            </p>
                            <div className="settings__field">
                                <select
                                    id="settings-job-track"
                                    className="settings__select"
                                    aria-labelledby="settings-job-track-label"
                                    value={form.jobCategory}
                                    onChange={(event) => handleJobCategorySelect(event.target.value)}
                                >
                                    {jobData.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.jobCategory === 'other' && (
                                <div className="settings__field" style={{ marginTop: '12px' }}>
                                    <input
                                        type="text"
                                        id="settings-custom-job-track"
                                        className="settings__select"
                                        placeholder="직군을 입력해주세요"
                                        value={form.jobCategoryOther}
                                        onChange={(event) =>
                                            setForm((prev) => ({ ...prev, jobCategoryOther: event.target.value }))
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {selectedJobRoles.length > 0 && (
                        <div className="settings__group">
                            <p id="settings-job-role-label" className="settings__subhead">
                                세부 직무 (Job Role)
                            </p>
                            <div className="settings__field">
                                <select
                                    id="settings-job-role"
                                    className="settings__select"
                                    aria-labelledby="settings-job-role-label"
                                    value={form.jobRole}
                                    onChange={(event) => handleJobRoleSelect(event.target.value)}
                                >
                                    {selectedJobRoles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        )}

                    </div>
                </fieldset>

                <fieldset>
                    <b>질문 빈도</b>
                    <div className="settings__cadence">
                        {cadencePresets.map((option) => {
                            const checked = form.questionCadence === option.id
                            return (
                                <label key={option.id} className={`cadence-card ${checked ? 'is-checked' : ''}`}>
                                    <input
                                        type="radio"
                                        name="question-cadence"
                                        value={option.id}
                                        checked={checked}
                                        onChange={() => setForm((prev) => ({...prev, questionCadence: option.id}))}
                                    />
                                    <div>
                                        <strong>{option.label}</strong>
                                        <br></br>
                                        <small>{option.description}</small>
                                    </div>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                <fieldset>
                    <b>알림 채널</b>
                    <div className="settings__channels">
                        {notificationChannelPresets.map((channel) => {
                            const isEmail = channel.id === 'email'
                            const checked = isEmail || form.notificationChannels.includes(channel.id)
                            return (
                                <label key={channel.id} className={`channel-pill ${isEmail ? 'is-default' : ''}`}>
                                    <input
                                        type="checkbox"
                                        disabled={isEmail}
                                        checked={checked}
                                        onChange={() => toggleChannel(channel.id)}
                                    />
                                    <span>
                      {channel.label}
                                        {isEmail && <small>(기본)</small>}
                    </span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                <button type="submit" className="cta-button cta-button--primary">
                    변경 사항 저장
                </button>
                {status && <p className="settings__status">{status}</p>}
            </form>

            <div className="settings__danger-zone">
                <h2 className="settings__danger-title">위험 구역</h2>
                <p className="settings__danger-description">
                    회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="settings__delete-button"
                >
                    회원 탈퇴
                </button>
            </div>
        </div>
    )
}
