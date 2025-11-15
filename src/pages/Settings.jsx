import {motion} from 'framer-motion'
import {useEffect, useState} from 'react'
import {useAppState} from '../context/AppStateContext'
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
    const {user, updateSettings, cadencePresets, notificationChannelPresets, jobTracks} = useAppState()
    const tracks = jobTracks ?? []
    const fallbackTrackId = user?.jobTrackId ?? tracks[0]?.id ?? ''
    const fallbackTrack = tracks.find((track) => track.id === fallbackTrackId) ?? tracks[0]
    const fallbackRoleId = user?.jobRoleId ?? fallbackTrack?.roles?.[0]?.id ?? ''
    const focusMatch = focusAreas.find((area) => area.label === user?.focusArea)
    const fallbackFocusAreaId = focusMatch?.id ?? focusAreas[0]?.id ?? ''

    const [form, setForm] = useState({
        jobTrackId: fallbackTrackId,
        jobRoleId: fallbackRoleId,
        focusAreaId: fallbackFocusAreaId,
        questionCadence: user?.questionCadence ?? 'daily',
        notificationChannels: user?.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
    })
    const [status, setStatus] = useState('')
    const selectedTrack = tracks.find((track) => track.id === form.jobTrackId) ?? tracks[0]
    const selectedRole =
        selectedTrack?.roles?.find((role) => role.id === form.jobRoleId) ?? selectedTrack?.roles?.[0]

    useEffect(() => {
        if (!user) return
        const nextTrackId = user.jobTrackId ?? tracks[0]?.id ?? ''
        const nextTrack = tracks.find((track) => track.id === nextTrackId) ?? tracks[0]
        const nextRoleId = user.jobRoleId ?? nextTrack?.roles?.[0]?.id ?? ''
        const nextFocusAreaId =
            focusAreas.find((area) => area.label === user.focusArea)?.id ?? focusAreas[0]?.id ?? ''

        setForm({
            jobTrackId: nextTrackId,
            jobRoleId: nextRoleId,
            focusAreaId: nextFocusAreaId,
            questionCadence: user.questionCadence ?? 'daily',
            notificationChannels: user.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
        })
    }, [user, tracks])

    const handleTrackSelect = (trackId) => {
        setForm((prev) => {
            if (prev.jobTrackId === trackId) return prev
            const nextTrack = tracks.find((track) => track.id === trackId)
            return {
                ...prev,
                jobTrackId: trackId,
                jobRoleId: nextTrack?.roles?.[0]?.id ?? '',
            }
        })
    }

    const handleRoleSelect = (roleId) => {
        setForm((prev) => ({...prev, jobRoleId: roleId}))
    }

    const handleFocusSelect = (focusId) => {
        setForm((prev) => ({...prev, focusAreaId: focusId}))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const cadenceMeta = cadencePresets.find((item) => item.id === form.questionCadence)
        const trackMeta = tracks.find((track) => track.id === form.jobTrackId)
        const roleMeta = trackMeta?.roles?.find((role) => role.id === form.jobRoleId)
        const focusMeta = focusAreas.find((area) => area.id === form.focusAreaId)
        updateSettings({
            jobTrackId: trackMeta?.id ?? '',
            jobTrackLabel: trackMeta?.label ?? '',
            jobRoleId: roleMeta?.id ?? '',
            jobRoleLabel: roleMeta?.label ?? '',
            desiredField: roleMeta?.label ?? trackMeta?.label ?? user?.desiredField ?? '',
            focusArea: focusMeta?.label ?? '',
            questionCadence: form.questionCadence,
            questionCadenceLabel: cadenceMeta?.label,
            questionSchedule: cadenceMeta?.schedule,
            notificationChannels: ['email', ...form.notificationChannels],
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

    return (
        <div className="settings">
            <header className="settings__header">
                <div>
                    <span className="tag">Personal Control Center</span>
                    <h1>개인 설정</h1>
                    <p>목표와 루틴을 조정하면 AI 코치가 난이도, 질문 스타일, 리워드 제안을 맞춰 드립니다.</p>
                </div>
                <motion.div className="settings__card" initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}}>
                    <span>현재 잔여 포인트</span>
                    <strong>{user?.points.toLocaleString()} pts</strong>
                </motion.div>
            </header>

            <form className="settings__form" onSubmit={handleSubmit}>
                <fieldset>
                    <legend>목표 직무 · 관심 분야</legend>
                    <div className="settings__goal-section">
                        <div className="settings__group">
                            <p id="settings-job-track-label" className="settings__subhead">
                                직군 (Job Category)
                            </p>
                            {tracks.length > 0 ? (
                                <div className="settings__field">
                                    <select
                                        id="settings-job-track"
                                        className="settings__select"
                                        aria-labelledby="settings-job-track-label"
                                        value={form.jobTrackId}
                                        onChange={(event) => handleTrackSelect(event.target.value)}
                                    >
                                        {tracks.map((track) => (
                                            <option key={track.id} value={track.id}>
                                                {track.label}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedTrack?.description && (
                                        <p className="settings__field-note">{selectedTrack.description}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="settings__empty">직무 정보를 불러오는 중입니다.</p>
                            )}
                        </div>

                        <div className="settings__group">
                            <p id="settings-job-role-label" className="settings__subhead">
                                세부 직무 (Job Role)
                            </p>
                            {selectedTrack?.roles?.length ? (
                                <div className="settings__field">
                                    <select
                                        id="settings-job-role"
                                        className="settings__select"
                                        aria-labelledby="settings-job-role-label"
                                        value={form.jobRoleId}
                                        onChange={(event) => handleRoleSelect(event.target.value)}
                                    >
                                        {selectedTrack.roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className="settings__empty">먼저 직군을 선택해 주세요.</p>
                            )}
                            {selectedRole?.example && (
                                <p className="settings__field-note">예시 키워드 · {selectedRole.example}</p>
                            )}
                            {selectedRole?.reason && <p className="settings__role-hint">{selectedRole.reason}</p>}
                        </div>

                        <div className="settings__group">
                            <p className="settings__subhead">관심 분야</p>
                            <div className="settings__focus-grid">
                                {focusAreas.map((area) => {
                                    const checked = form.focusAreaId === area.id
                                    return (
                                        <label key={area.id} className={`focus-card ${checked ? 'is-checked' : ''}`}>
                                            <input
                                                type="radio"
                                                name="focus-area"
                                                value={area.id}
                                                checked={checked}
                                                onChange={() => handleFocusSelect(area.id)}
                                            />
                                            <div>
                                                <strong>{area.label}</strong>
                                                <small>{area.description}</small>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>질문 빈도</legend>
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
                    <legend>알림 채널</legend>
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
        </div>
    )
}
