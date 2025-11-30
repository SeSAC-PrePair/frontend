import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import {jobData} from '../constants/onboarding'
import Modal from '../components/Modal'
import {getUserInfo, updateUserInfo} from '../utils/authApi'
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
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false)
    const selectedJobCategory = jobData.find((cat) => cat.id === form.jobCategory) ?? defaultJobCategory
    // 선택한 직군이 '기타'가 아닌 경우, 세부 직무 옵션에서 '기타' 항목은 숨김
    const selectedJobRoles = selectedJobCategory
        ? selectedJobCategory.roles.filter((role) =>
            selectedJobCategory.id === 'other' ? true : role !== '기타'
        )
        : []

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
                
                // job_category 매핑 (API 응답의 job_category를 jobData의 id로 변환)
                const apiJobCategory = apiSettings.job_category || ''
                const matchedJobCategory = jobData.find((cat) => 
                    cat.label === apiJobCategory || cat.id === apiJobCategory
                )
                const nextJobCategoryId = matchedJobCategory ? matchedJobCategory.id : (user.jobTrackId === 'other' ? 'other' : (user.jobTrackId ?? defaultJobCategory.id))
                const nextJobCategory = nextJobCategoryId === 'other' ? null : jobData.find((cat) => cat.id === nextJobCategoryId) ?? defaultJobCategory
                
                // job_role 매핑
                const apiJobRole = apiSettings.job_role || ''
                const nextJobRole = apiJobRole || (user.jobRoleLabel ?? (nextJobCategory ? nextJobCategory.roles[0] : ''))
                
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
                
                // focusArea는 API 응답에 없으므로 기존 값 유지
                const nextFocusAreaId = focusAreas.find((area) => area.label === user.focusArea)?.id ?? focusAreas[0]?.id ?? ''

                setForm({
                    name: apiName || (user.name ?? ''),
                    email: apiEmail || (user.email ?? ''),
                    jobCategory: nextJobCategoryId,
                    jobRole: nextJobRole,
                    focusAreaId: nextFocusAreaId,
                    questionCadence: nextQuestionCadence,
                    notificationChannels: notificationChannels,
                    jobCategoryOther: nextJobCategoryId === 'other' ? apiJobCategory : (user.customJobLabel ?? ''),
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
        
        const nextJobCategoryId = user.jobTrackId === 'other' ? 'other' : (user.jobTrackId ?? defaultJobCategory.id)
        const nextJobCategory = nextJobCategoryId === 'other' ? null : jobData.find((cat) => cat.id === nextJobCategoryId) ?? defaultJobCategory
        const nextJobRole = user.jobRoleLabel ?? (nextJobCategory ? nextJobCategory.roles[0] : '')
        const nextFocusAreaId =
            focusAreas.find((area) => area.label === user.focusArea)?.id ?? focusAreas[0]?.id ?? ''

        // form이 비어있을 때만 기존 user 데이터 사용
        if (form.name === '' && form.email === '') {
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
        }
    }, [user, isLoadingUserInfo, form.name, form.email])

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

    const handleSubmit = async (event) => {
        event.preventDefault()
        
        if (!user?.id) {
            setStatus('사용자 정보를 찾을 수 없습니다.')
            setTimeout(() => setStatus(''), 2400)
            return
        }
        
        try {
            const cadenceMeta = cadencePresets.find((item) => item.id === form.questionCadence)
            const categoryMeta = jobData.find((cat) => cat.id === form.jobCategory)
            const focusMeta = focusAreas.find((area) => area.id === form.focusAreaId)
            const isOther = form.jobCategory === 'other'
            
            // API 스펙에 맞게 데이터 변환
            // job_category: 'other'인 경우 직접 입력한 값, 아니면 label
            const jobCategory = isOther ? form.jobCategoryOther : (categoryMeta?.label ?? '')
            
            // job_role: jobRole 값 (기타가 아닌 경우 form.jobRole 사용)
            const jobRole = isOther ? form.jobCategoryOther : (form.jobRole ?? '')
            
            // notification 설정
            const hasKakao = form.notificationChannels.includes('kakao')
            
            // API 호출
            await updateUserInfo(user.id, {
                user_name: form.name || '',
                user_email: form.email || '',
                job_category: jobCategory,
                job_role: jobRole,
                question_frequency: 0, // API 스펙에 따라 기본값 0
                notification: {
                    email: true, // 이메일은 항상 true (기본)
                    kakao: hasKakao,
                },
            })
            
            // 로컬 상태 업데이트
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
        } catch (error) {
            console.error('[Settings] 회원 정보 수정 실패:', error)
            setStatus(error.message || '저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
            setTimeout(() => setStatus(''), 3000)
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
