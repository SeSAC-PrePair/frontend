import {useEffect, useState, useCallback} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import Modal from '../components/Modal'
import {getUserInfo, updateUserInfo} from '../utils/authApi'
import '../styles/pages/Settings.css'

export default function SettingsPage() {
    const {user, updateSettings, deleteAccount, cadencePresets, notificationChannelPresets} = useAppState()
    const navigate = useNavigate()
    const location = useLocation()

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
    const [hasFetchedFromApi, setHasFetchedFromApi] = useState(false) // API 호출 성공 여부 추적
    const [kakaoAuthCompleted, setKakaoAuthCompleted] = useState(false) // 카카오 인증 완료 여부
    const [previousNotificationChannels, setPreviousNotificationChannels] = useState([]) // 이전 알림 채널 상태 추적

    // 사용자 정보를 가져와서 form 상태를 업데이트하는 함수
    const fetchUserInfo = useCallback(async () => {
        if (!user?.id) return
        
        setIsLoadingUserInfo(true)
        try {
            const userInfo = await getUserInfo(user.id)
            
            // 디버깅: 백엔드 응답 구조 확인
            console.log('[Settings] 백엔드 응답 데이터:', userInfo)
            console.log('[Settings] userInfo.job:', userInfo.job)
            console.log('[Settings] userInfo.schedule_type:', userInfo.schedule_type)
            console.log('[Settings] userInfo.notification_type:', userInfo.notification_type)
            
            // API 응답 데이터 매핑
            // 백엔드 응답 구조: { name, email, job, schedule_type, notification_type }
            // settings 객체가 없고 최상위 레벨에 필드가 있음
            const apiName = userInfo.name || ''
            const apiEmail = userInfo.email || ''
            
            // 백엔드에서 job 필드로 저장했으면, GET API에서도 job 필드로 반환됨
            const apiJob = userInfo.job || ''
            
            // 백엔드 응답 데이터를 우선 사용 (백엔드가 최신 데이터)
            const nextJobDescription = apiJob || ''
            
            // schedule_type 매핑 (DAILY -> daily 등)
            const apiScheduleType = userInfo.schedule_type || ''
            const scheduleTypeMap = {
                'DAILY': 'daily',
                'WEEKLY': 'weekly',
                'MONTHLY': 'monthly',
            }
            // 백엔드 응답이 있으면 백엔드 데이터 우선 사용
            const nextQuestionCadence = apiScheduleType 
                ? scheduleTypeMap[apiScheduleType] || 'daily'
                : (user.questionCadence ?? 'daily')
            
            // notification_type 매핑
            const apiNotificationType = userInfo.notification_type || 'EMAIL'
            // 카카오 인증 여부 확인 (notification_type이 KAKAO 또는 BOTH인 경우)
            const isKakaoConnected = apiNotificationType === 'KAKAO' || apiNotificationType === 'BOTH'
            // 백엔드 응답이 있으면 백엔드 데이터 우선 사용
            // 카카오 인증이 완료된 경우 알림 채널에 카카오 포함
            const notificationChannels = isKakaoConnected ? ['kakao'] : []

            console.log('[Settings] 파싱된 데이터:', {
                jobDescription: nextJobDescription,
                questionCadence: nextQuestionCadence,
                notificationChannels: notificationChannels,
                notification_type: apiNotificationType,
                isKakaoConnected: isKakaoConnected,
            })

            setForm({
                name: apiName || (user.name ?? ''),
                email: apiEmail || (user.email ?? ''),
                jobDescription: nextJobDescription,
                questionCadence: nextQuestionCadence,
                notificationChannels: notificationChannels,
            })

            // 카카오 인증 완료 여부 설정 (kakao_connected 또는 notification_type이 KAKAO이면 인증 완료로 간주)
            setKakaoAuthCompleted(isKakaoConnected)
            
            // API 호출 성공 표시
            setHasFetchedFromApi(true)
        } catch (error) {
            // 405 Method Not Allowed는 조용히 처리 (서버가 GET 메서드를 지원하지 않을 수 있음)
            if (error.message === 'GET_METHOD_NOT_ALLOWED' || error.message.includes('405')) {
                console.warn('[Settings] GET /api/users/me가 지원되지 않습니다 (405 Method Not Allowed). 기존 사용자 데이터를 사용합니다.')
                setHasFetchedFromApi(false) // API 호출 실패
            } else {
                console.error('[Settings] 사용자 정보 조회 실패:', error)
                setHasFetchedFromApi(false) // API 호출 실패
            }
            // 에러 발생 시 기존 user 데이터 사용 (다음 useEffect에서 처리됨)
        } finally {
            setIsLoadingUserInfo(false)
        }
    }, [user])

    // 페이지 마운트 시 사용자 정보 조회
    useEffect(() => {
        // user.id가 변경되면 API 호출 상태 리셋
        setHasFetchedFromApi(false)
        fetchUserInfo()
    }, [fetchUserInfo])

    // URL 파라미터에서 카카오 인증 완료 여부 확인
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const kakaoSuccess = searchParams.get('kakao') === 'success'
        const email = searchParams.get('email')
        
        if (kakaoSuccess && email && user?.email === email) {
            console.log('[Settings] 카카오 인증 완료 확인')
            setKakaoAuthCompleted(true)
            // URL에서 파라미터 제거
            navigate('/settings', { replace: true })
        }
    }, [location.search, user?.email, navigate])

    // 이전 알림 채널 상태 추적 (카카오 알림을 새로 선택했는지 확인하기 위해)
    useEffect(() => {
        if (hasFetchedFromApi) {
            setPreviousNotificationChannels(form.notificationChannels)
        }
    }, [hasFetchedFromApi, form.notificationChannels])

    // API 호출이 실패했을 때만 폴백 데이터 설정 (API 성공 시에는 실행하지 않음)
    useEffect(() => {
        if (!user) return
        // API 호출 중이면 대기
        if (isLoadingUserInfo) return
        // API 호출이 성공했으면 폴백 로직 실행하지 않음
        if (hasFetchedFromApi) return
        
        const nextJobCategory = user.jobTrackLabel ?? user.customJobLabel ?? ''
        const nextJobRole = user.jobRoleLabel ?? ''
        const nextFocusArea = user.focusArea ?? ''
        
        // 서술형 필드로 통합 (회원가입 시 입력한 직무 정보 우선 표시)
        // jobRole이 있으면 그것을 우선 사용
        const jobDescriptionParts = []
        if (nextJobCategory) jobDescriptionParts.push(nextJobCategory)
        if (nextJobRole) jobDescriptionParts.push(nextJobRole)
        if (nextFocusArea) jobDescriptionParts.push(nextFocusArea)
        // jobRole만 있어도 표시 (회원가입 시 입력한 직무가 가장 중요)
        const nextJobDescription = nextJobRole || jobDescriptionParts.join(', ') || ''

        // form이 비어있을 때만 기존 user 데이터 사용 (API 호출 실패 시에만)
        if (form.name === '' && form.email === '') {
            setForm({
                name: user.name ?? '',
                email: user.email ?? '',
                jobDescription: nextJobDescription,
                questionCadence: user.questionCadence ?? 'daily',
                notificationChannels: user.notificationChannels?.filter((channel) => channel !== 'email') ?? [],
            })
        }
    }, [user, isLoadingUserInfo, hasFetchedFromApi, form.name, form.email])


    const handleSubmit = async (event) => {
        event.preventDefault()
        
        if (!user?.id) {
            setStatus('사용자 정보를 찾을 수 없습니다.')
            setTimeout(() => setStatus(''), 2400)
            return
        }

        // 카카오 알림 선택했지만 인증 안 함 → 인증 필요 경고
        const hasKakao = form.notificationChannels.includes('kakao')
        if (hasKakao && !kakaoAuthCompleted) {
            alert('카카오 알림을 사용하려면 먼저 카카오 인증을 완료해주세요.')
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
            
            // schedule_type 매핑 (daily -> DAILY 등)
            const scheduleTypeMap = {
                'daily': 'DAILY',
                'weekly': 'WEEKLY',
                'monthly': 'MONTHLY',
            }
            const scheduleType = scheduleTypeMap[form.questionCadence] || 'DAILY'
            
            // notification_type 매핑
            const notificationType = hasKakao ? 'KAKAO' : 'EMAIL'
            
            // API 호출 (새로운 서버 스펙에 맞게)
            await updateUserInfo(user.id, {
                job: jobDescription,
                schedule_type: scheduleType,
                notification_type: notificationType,
            })
            
            // 백엔드에서 변경된 최신 데이터를 다시 가져와서 form 상태 업데이트
            await fetchUserInfo()
            
            // 로컬 상태 업데이트
            updateSettings({
                jobTrackId: '',
                jobTrackLabel: jobDescription,
                jobRoleId: '',
                jobRoleLabel: jobDescription,
                desiredField: jobDescription || user?.desiredField || '',
                focusArea: '', // 서술형으로 통합했으므로 빈 값
                questionCadence: form.questionCadence,
                questionCadenceLabel: cadenceMeta?.label,
                questionSchedule: cadenceMeta?.schedule,
                notificationChannels: ['email', ...form.notificationChannels],
                customJobLabel: jobDescription,
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
                // 카카오 알림 해제 시 인증 상태도 초기화
                if (channelId === 'kakao') {
                    setKakaoAuthCompleted(false)
                }
                return {
                    ...prev,
                    notificationChannels: prev.notificationChannels.filter((id) => id !== channelId),
                }
            }
            // 카카오 알림 선택 시 인증 상태 초기화 (새로 인증 필요)
            if (channelId === 'kakao') {
                setKakaoAuthCompleted(false)
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
                    
                    {/* 카카오 알림 선택 시: 인증하기 버튼 또는 완료 메시지 */}
                    {form.notificationChannels.includes('kakao') && !kakaoAuthCompleted && (
                        <div className="settings__kakao-auth-container">
                            <button
                                type="button"
                                onClick={() => {
                                    // 카카오 인증 페이지로 리다이렉트
                                    console.log('[Settings] 카카오 인증하기 버튼 클릭')
                                    console.log('[Settings] 카카오 인증 페이지로 리다이렉트')
                                    
                                    const email = form.email || user?.email || ''
                                    
                                    // localStorage에 Settings에서 왔다는 정보 저장
                                    localStorage.setItem('pendingKakaoAuth', JSON.stringify({
                                        from: 'settings',
                                        email: email,
                                        timestamp: Date.now()
                                    }))
                                    
                                    const redirectUri = `${window.location.origin}/settings?kakao=success&email=${encodeURIComponent(email)}`
                                    
                                    // redirect_uri와 from 파라미터 모두 전달 (백엔드 지원 여부에 따라)
                                    window.location.href = `https://prepair.wisoft.dev/api/auth/kakao?email=${encodeURIComponent(email)}&redirect_uri=${encodeURIComponent(redirectUri)}&from=settings`
                                }}
                                className="settings__kakao-auth-button"
                            >
                                🔐 카카오 인증하기
                            </button>
                            <p className="settings__kakao-auth-hint">
                                <span role="img" aria-label="info icon" style={{ marginRight: '4px' }}>ℹ️</span>
                                카카오톡 알림을 사용하려면 먼저 카카오 인증을 완료해주세요.
                            </p>
                        </div>
                    )}
                    
                    {/* 카카오 인증 완료 */}
                    {form.notificationChannels.includes('kakao') && kakaoAuthCompleted && (
                        <div className="settings__kakao-auth-success">
                            <span role="img" aria-label="check" style={{ marginRight: '6px' }}>✅</span>
                            카카오 인증이 완료되었습니다!
                        </div>
                    )}
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
