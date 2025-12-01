import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import Modal from '../components/Modal'
import {getUserInfo, updateUserInfo} from '../utils/authApi'
import '../styles/pages/Settings.css'

export default function SettingsPage() {
    const {user, updateSettings, deleteAccount, cadencePresets, notificationChannelPresets} = useAppState()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
        jobDescription: '', // 통합된 서술형 필드
        questionCadence: user?.questionCadence ?? 'daily',
        notificationChannels: user?.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
    })
    const [status, setStatus] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // 페이지 마운트 시 사용자 정보 조회
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!user?.id) return
            
            setIsLoadingUserInfo(true)
            try {
                const userInfo = await getUserInfo(user.id)
                
                // API 응답 데이터 매핑
                const apiName = userInfo.name || ''
                const apiEmail = userInfo.email || ''
                const apiSettings = userInfo.settings || {}
                
                // job_category, job_role, focusArea를 통합하여 서술형 필드로 구성
                const apiJobCategory = apiSettings.job_category || ''
                const apiJobRole = apiSettings.job_role || ''
                const apiFocusArea = apiSettings.focus_area || ''
                
                // 기존 user 데이터와 API 데이터를 결합
                const jobCategory = apiJobCategory || (user.jobTrackLabel ?? user.customJobLabel ?? '')
                const jobRole = apiJobRole || (user.jobRoleLabel ?? '')
                const focusArea = apiFocusArea || (user.focusArea ?? '')
                
                // 서술형 필드로 통합 (기존 값들을 조합)
                const jobDescriptionParts = []
                if (jobCategory) jobDescriptionParts.push(jobCategory)
                if (jobRole) jobDescriptionParts.push(jobRole)
                if (focusArea) jobDescriptionParts.push(focusArea)
                const nextJobDescription = jobDescriptionParts.join(', ') || ''
                
                // schedule_type 매핑 (DAILY -> daily 등)
                const apiScheduleType = apiSettings.schedule_type || ''
                const scheduleTypeMap = {
                    'DAILY': 'daily',
                    'WEEKLY': 'weekly',
                    'MONTHLY': 'monthly',
                }
                const nextQuestionCadence = scheduleTypeMap[apiScheduleType] || (user.questionCadence ?? 'daily')
                
                // notification_type 매핑
                const apiNotificationType = apiSettings.notification_type || 'EMAIL'
                const notificationChannels = apiNotificationType === 'KAKAO' ? ['kakao'] : []

                setForm({
                    name: apiName || (user.name ?? ''),
                    email: apiEmail || (user.email ?? ''),
                    jobDescription: nextJobDescription,
                    questionCadence: nextQuestionCadence,
                    notificationChannels: notificationChannels,
                })
            } catch (error) {
                // 405 Method Not Allowed는 조용히 처리 (서버가 GET 메서드를 지원하지 않을 수 있음)
                if (error.message === 'GET_METHOD_NOT_ALLOWED' || error.message.includes('405')) {
                    console.warn('[Settings] GET /api/users/me가 지원되지 않습니다 (405 Method Not Allowed). 기존 사용자 데이터를 사용합니다.')
                } else {
                    console.error('[Settings] 사용자 정보 조회 실패:', error)
                }
                // 에러 발생 시 기존 user 데이터 사용 (다음 useEffect에서 처리됨)
            } finally {
                setIsLoadingUserInfo(false)
            }
        }
        
        fetchUserInfo()
    }, [user?.id])

    // API 호출이 실패하거나 user가 변경되었을 때 폴백 데이터 설정
    useEffect(() => {
        if (!user) return
        // API 호출이 완료되고 form이 비어있을 때만 폴백 데이터 사용
        if (isLoadingUserInfo) return
        
        const nextJobCategory = user.jobTrackLabel ?? user.customJobLabel ?? ''
        const nextJobRole = user.jobRoleLabel ?? ''
        const nextFocusArea = user.focusArea ?? ''
        
        // 서술형 필드로 통합
        const jobDescriptionParts = []
        if (nextJobCategory) jobDescriptionParts.push(nextJobCategory)
        if (nextJobRole) jobDescriptionParts.push(nextJobRole)
        if (nextFocusArea) jobDescriptionParts.push(nextFocusArea)
        const nextJobDescription = jobDescriptionParts.join(', ') || ''

        // form이 비어있을 때만 기존 user 데이터 사용
        if (form.name === '' && form.email === '') {
            setForm({
                name: user.name ?? '',
                email: user.email ?? '',
                jobDescription: nextJobDescription,
                questionCadence: user.questionCadence ?? 'daily',
                notificationChannels: user.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
            })
        }
    }, [user, isLoadingUserInfo, form.name, form.email])


    const handleSubmit = async (event) => {
        event.preventDefault()
        
        if (!user?.id) {
            setStatus('사용자 정보를 찾을 수 없습니다.')
            setTimeout(() => setStatus(''), 2400)
            return
        }
        
        setIsSaving(true)
        setStatus('')
        
        try {
            const cadenceMeta = cadencePresets.find((item) => item.id === form.questionCadence)
            
            // 서술형 필드에서 받은 내용을 그대로 사용
            let jobDescription = form.jobDescription?.trim() || ''
            
            // 이모지 제거 (서버가 이모지를 허용하지 않을 수 있음)
            jobDescription = jobDescription.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
            
            // API 스펙에 맞게 데이터 변환
            // job_category와 job_role을 분리하거나, job_role에 전체 내용 저장
            // 현재는 서술형 필드 전체를 job_role로 저장
            // job_category는 빈 문자열이면 서버 validation 실패할 수 있으므로 기본값 설정
            const jobCategory = '' // 서술형으로 통합했으므로 빈 값 (서버가 허용하는지 확인 필요)
            const jobRole = jobDescription // 전체 내용을 job_role로 저장
            
            // notification 설정
            const hasKakao = form.notificationChannels.includes('kakao')
            
            // API 호출 (서버 스펙에 맞게)
            await updateUserInfo(user.id, {
                user_name: form.name || '',
                user_email: form.email || '',
                job_category: jobCategory,
                job_role: jobRole,
                question_frequency: 0, // 기본값 0
                notification: {
                    email: true, // 이메일은 항상 true (기본)
                    kakao: hasKakao,
                },
            })
            
            // 로컬 상태 업데이트
            updateSettings({
                jobTrackId: '',
                jobTrackLabel: jobCategory,
                jobRoleId: '',
                jobRoleLabel: jobRole,
                desiredField: jobRole || user?.desiredField || '',
                focusArea: '', // 서술형으로 통합했으므로 빈 값
                questionCadence: form.questionCadence,
                questionCadenceLabel: cadenceMeta?.label,
                questionSchedule: cadenceMeta?.schedule,
                notificationChannels: ['email', ...form.notificationChannels],
                customJobLabel: jobCategory,
            })
            
            setStatus('저장되었습니다!')
            setTimeout(() => setStatus(''), 2400)
        } catch (error) {
            console.error('[Settings] 회원 정보 수정 실패:', error)
            setStatus(error.message || '저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
            setTimeout(() => setStatus(''), 3000)
        } finally {
            setIsSaving(false)
        }
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
        setShowDeleteModal(true)
        setDeletePassword('')
        setDeleteError('')
    }

    const handleDeleteConfirm = async () => {
        if (!deletePassword || !deletePassword.trim()) {
            setDeleteError('비밀번호를 입력해주세요.')
            return
        }

        if (!user || !user.id) {
            setDeleteError('사용자 정보를 찾을 수 없습니다.')
            return
        }

        setIsDeleting(true)
        setDeleteError('')

        try {
            await deleteAccount(deletePassword)
            setShowDeleteModal(false)
            navigate('/', {replace: true})
        } catch (error) {
            console.error('회원 탈퇴 오류:', error)
            setDeleteError(error.message || '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteCancel = () => {
        setShowDeleteModal(false)
        setDeletePassword('')
        setDeleteError('')
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
                        
                            <div className="settings__field">
                                <textarea
                                    id="settings-job-description"
                                    className="settings__select"
                                    aria-labelledby="settings-job-description-label"
                                    placeholder="목표 직무 및 관심 분야를 입력하세요 (예: 프론트엔드 개발자, 마케팅 매니저, 프로덕트 전략 등)"
                                    value={form.jobDescription}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, jobDescription: event.target.value }))
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>
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

                <button 
                    type="submit" 
                    className="cta-button cta-button--primary"
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '변경 사항 저장'}
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

            <Modal
                open={showDeleteModal}
                onClose={handleDeleteCancel}
                title="회원 탈퇴"
                size="md"
            >
                <div style={{ padding: '20px 0' }}>
                    <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.6' }}>
                        정말 회원 탈퇴를 하시겠습니까?<br />
                        탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                    </p>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            가입 시 사용한 비밀번호
                        </label>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => {
                                setDeletePassword(e.target.value)
                                setDeleteError('')
                            }}
                            placeholder="비밀번호를 입력해주세요"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: deleteError ? '1px solid #e74c3c' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '15px',
                            }}
                            disabled={isDeleting}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isDeleting) {
                                    handleDeleteConfirm()
                                }
                            }}
                        />
                        {deleteError && (
                            <p style={{ marginTop: '8px', color: '#e74c3c', fontSize: '14px' }}>
                                {deleteError}
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={handleDeleteCancel}
                        className="cta-button cta-button--ghost"
                        disabled={isDeleting}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteConfirm}
                        className="cta-button cta-button--primary"
                        disabled={isDeleting || !deletePassword.trim()}
                        style={{ 
                            backgroundColor: isDeleting ? '#ccc' : '#e74c3c',
                            minWidth: '120px'
                        }}
                    >
                        {isDeleting ? '처리 중...' : '탈퇴하기'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}
