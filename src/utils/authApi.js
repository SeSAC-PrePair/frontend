/**
 * 인증 관련 API 유틸리티
 */

/**
 * 사용자 정보를 조회합니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{name: string, email: string, settings: {job_category: string, job_role: string, schedule_type: string, notification_type: string}}>}
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getUserInfo(userId) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    const apiUrl = `/api/users/me`
    
    try {
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Get User Info API] ===== Request Details =====')
        console.log('[Get User Info API] Request URL:', apiUrl)
        console.log('[Get User Info API] Full URL:', window.location.origin + apiUrl)
        console.log('[Get User Info API] Request Method: GET')
        console.log('[Get User Info API] User ID:', userId)
        console.log('[Get User Info API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Get User Info API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Get User Info API] ===== Response Details =====')
        console.log('[Get User Info API] Response status:', response.status)
        console.log('[Get User Info API] Content-Type:', contentType)
        console.log('[Get User Info API] Response text:', responseText)
        console.log('[Get User Info API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                const errorMessage = errorData.message || errorData.error || '잘못된 요청입니다.'
                console.error('[Get User Info API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 401 Unauthorized 에러 처리
            if (response.status === 401) {
                const errorMessage = errorData.message || errorData.error || '인증이 필요합니다.'
                console.error('[Get User Info API] 401 Unauthorized:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '사용자 정보를 찾을 수 없습니다.'
                console.error('[Get User Info API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            // 405 Method Not Allowed 에러 처리 (서버가 GET 메서드를 지원하지 않는 경우)
            if (response.status === 405) {
                const errorMessage = errorData.message || errorData.error || 'GET 메서드가 지원되지 않습니다.'
                console.warn('[Get User Info API] 405 Method Not Allowed:', errorMessage)
                throw new Error('GET_METHOD_NOT_ALLOWED')
            }

            throw new Error(
                errorData.message || 
                `사용자 정보 조회에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 (200 OK)
        let responseData
        try {
            responseData = JSON.parse(responseText)
        } catch (parseError) {
            throw new Error('서버 응답을 파싱할 수 없습니다.')
        }

        console.log('[Get User Info API] 사용자 정보 조회가 성공적으로 완료되었습니다.')
        return responseData
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}

/**
 * 회원 탈퇴를 수행합니다.
 * @param {string} userId - 사용자 ID
 * @param {string} password - 가입 시 사용한 비밀번호
 * @returns {Promise<void>}
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function deleteUser(userId, password) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    // password 검증
    if (!password || typeof password !== 'string' || !password.trim()) {
        throw new Error('비밀번호를 입력해주세요.')
    }

    const apiUrl = `/api/users/me`
    
    try {
        const requestBody = {
            password: password.trim(),
        }
        
        const requestBodyString = JSON.stringify(requestBody)
        
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Delete User API] ===== Request Details =====')
        console.log('[Delete User API] Request URL:', apiUrl)
        console.log('[Delete User API] Full URL:', window.location.origin + apiUrl)
        console.log('[Delete User API] Request Method: DELETE')
        console.log('[Delete User API] User ID:', userId)
        console.log('[Delete User API] User ID type:', typeof userId)
        console.log('[Delete User API] User ID trimmed:', userId.trim())
        console.log('[Delete User API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Delete User API] Request Body:', requestBodyString)
        console.log('[Delete User API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: requestHeaders,
            body: requestBodyString,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Delete User API] ===== Response Details =====')
        console.log('[Delete User API] Response status:', response.status)
        console.log('[Delete User API] Content-Type:', contentType)
        console.log('[Delete User API] Response text:', responseText)
        console.log('[Delete User API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리 (비밀번호 입력 필수)
            if (response.status === 400) {
                const errorMessage = errorData.message || errorData.error || '비밀번호를 입력해주세요.'
                console.error('[Delete User API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 401 Unauthorized 에러 처리 (비밀번호 틀림)
            if (response.status === 401) {
                const errorMessage = errorData.message || errorData.error || '비밀번호가 올바르지 않습니다.'
                console.error('[Delete User API] 401 Unauthorized:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리 (엔드포인트가 없음)
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '회원 탈퇴 API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.'
                console.error('[Delete User API] 404 Not Found:', errorMessage)
                console.error('[Delete User API] Requested URL:', apiUrl)
                throw new Error('회원 탈퇴 기능이 아직 준비되지 않았습니다. 관리자에게 문의해주세요.')
            }

            throw new Error(
                errorData.message || 
                `회원 탈퇴에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 (200 OK)
        console.log('[Delete User API] 회원 탈퇴가 성공적으로 완료되었습니다.')
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}

/**
 * 회원 정보를 수정합니다. (PATCH /api/users/me)
 * @param {string} userId - 사용자 ID
 * @param {Object} userData - 수정할 사용자 정보
 * @param {string} userData.job - 직무 (서술형)
 * @param {string} userData.schedule_type - 질문 빈도 타입 (DAILY, WEEKLY, MONTHLY)
 * @param {string} userData.notification_type - 알림 타입 (EMAIL, KAKAO)
 * @returns {Promise<void>}
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function updateUserInfo(userId, userData) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    const apiUrl = `/api/users/me`
    
    try {
        // 서버 스펙에 맞는 요청 본문 구성
        // job에서 이모지 제거 (서버가 이모지를 허용하지 않을 수 있음)
        let job = (userData.job && userData.job.trim()) 
            ? userData.job.trim() 
            : ''
        job = job.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
        
        const requestBody = {
            job: job,
            schedule_type: userData.schedule_type || 'DAILY',
            notification_type: userData.notification_type || 'EMAIL',
        }
        
        // 요청 본문 검증 로그
        console.log('[Update User Info API] Request Body (parsed):', JSON.stringify(requestBody, null, 2))
        console.log('[Update User Info API] Request Body values:', {
            job: requestBody.job,
            schedule_type: requestBody.schedule_type,
            notification_type: requestBody.notification_type,
        })
        
        const requestBodyString = JSON.stringify(requestBody)
        
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Update User Info API] ===== Request Details =====')
        console.log('[Update User Info API] Request URL:', apiUrl)
        console.log('[Update User Info API] Full URL:', window.location.origin + apiUrl)
        console.log('[Update User Info API] Request Method: PATCH')
        console.log('[Update User Info API] User ID:', userId)
        console.log('[Update User Info API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Update User Info API] Request Body:', requestBodyString)
        console.log('[Update User Info API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: requestHeaders,
            body: requestBodyString,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Update User Info API] ===== Response Details =====')
        console.log('[Update User Info API] Response status:', response.status)
        console.log('[Update User Info API] Content-Type:', contentType)
        console.log('[Update User Info API] Response text:', responseText)
        console.log('[Update User Info API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                // 서버 응답에서 더 자세한 에러 정보 추출
                const errorMessage = errorData.message || errorData.error || errorData.detail || '잘못된 요청입니다.'
                console.error('[Update User Info API] 400 Bad Request - Full Error:', {
                    errorData,
                    responseText,
                    requestBody: requestBody,
                    requestBodyString: requestBodyString,
                })
                throw new Error(errorMessage)
            }

            // 401 Unauthorized 에러 처리 (해당하는 유저가 없음)
            if (response.status === 401) {
                const errorMessage = errorData.message || errorData.error || '해당하는 유저가 없습니다.'
                console.error('[Update User Info API] 401 Unauthorized:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '회원 정보 수정 API 엔드포인트를 찾을 수 없습니다.'
                console.error('[Update User Info API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `회원 정보 수정에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 (200 OK)
        console.log('[Update User Info API] 회원 정보 수정이 성공적으로 완료되었습니다.')
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}

/**
 * 비밀번호 재설정을 수행합니다.
 * @param {string} email - 사용자 이메일
 * @param {string} password - 새 비밀번호
 * @returns {Promise<void>}
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function resetPassword(email, password) {
    // email 검증
    if (!email || typeof email !== 'string' || !email.trim()) {
        throw new Error('이메일을 입력해주세요.')
    }

    // password 검증
    if (!password || typeof password !== 'string' || !password.trim()) {
        throw new Error('비밀번호를 입력해주세요.')
    }

    const apiUrl = `/api/auth/reset`
    
    try {
        const requestBody = {
            email: email.trim(),
            password: password.trim(),
        }
        
        const requestBodyString = JSON.stringify(requestBody)
        
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Reset Password API] ===== Request Details =====')
        console.log('[Reset Password API] Request URL:', apiUrl)
        console.log('[Reset Password API] Full URL:', window.location.origin + apiUrl)
        console.log('[Reset Password API] Request Method: POST')
        console.log('[Reset Password API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Reset Password API] Request Body:', requestBodyString)
        console.log('[Reset Password API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBodyString,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Reset Password API] ===== Response Details =====')
        console.log('[Reset Password API] Response status:', response.status)
        console.log('[Reset Password API] Content-Type:', contentType)
        console.log('[Reset Password API] Response text:', responseText)
        console.log('[Reset Password API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                const errorMessage = errorData.message || errorData.error || '입력 정보를 확인해주세요.'
                console.error('[Reset Password API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '비밀번호 재설정 API 엔드포인트를 찾을 수 없습니다.'
                console.error('[Reset Password API] 404 Not Found:', errorMessage)
                throw new Error('비밀번호 재설정 기능이 아직 준비되지 않았습니다. 관리자에게 문의해주세요.')
            }

            throw new Error(
                errorData.message || 
                `비밀번호 재설정에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 (200 OK)
        console.log('[Reset Password API] 비밀번호 재설정이 성공적으로 완료되었습니다.')
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}

/**
 * 비밀번호 찾기를 수행합니다.
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{email: string, password: string}>}
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function findPassword(email) {
    // email 검증
    if (!email || typeof email !== 'string' || !email.trim()) {
        throw new Error('이메일을 입력해주세요.')
    }

    const apiUrl = `/api/auth/password`
    
    try {
        const requestBody = {
            email: email.trim(),
        }
        
        const requestBodyString = JSON.stringify(requestBody)
        
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Find Password API] ===== Request Details =====')
        console.log('[Find Password API] Request URL:', apiUrl)
        console.log('[Find Password API] Full URL:', window.location.origin + apiUrl)
        console.log('[Find Password API] Request Method: POST')
        console.log('[Find Password API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Find Password API] Request Body:', requestBodyString)
        console.log('[Find Password API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBodyString,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Find Password API] ===== Response Details =====')
        console.log('[Find Password API] Response status:', response.status)
        console.log('[Find Password API] Content-Type:', contentType)
        console.log('[Find Password API] Response text:', responseText)
        console.log('[Find Password API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                const errorMessage = errorData.message || errorData.error || '비밀번호 입력 필수'
                console.error('[Find Password API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리 (엔드포인트가 없음)
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '비밀번호 찾기 API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.'
                console.error('[Find Password API] 404 Not Found:', errorMessage)
                console.error('[Find Password API] Requested URL:', apiUrl)
                throw new Error('비밀번호 찾기 기능이 아직 준비되지 않았습니다. 관리자에게 문의해주세요.')
            }

            throw new Error(
                errorData.message || 
                `비밀번호 찾기에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 (200 OK)
        let responseData
        try {
            responseData = JSON.parse(responseText)
        } catch (parseError) {
            throw new Error('서버 응답을 파싱할 수 없습니다.')
        }

        console.log('[Find Password API] 비밀번호 찾기가 성공적으로 완료되었습니다.')
        return responseData
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}

/**
 * 사용자 요약 정보를 조회합니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<{answered_count: string, today_score: string, points: string}>}
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getUserSummary(userId) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    const apiUrl = `/api/users/me/summary`
    
    try {
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Get User Summary API] ===== Request Details =====')
        console.log('[Get User Summary API] Request URL:', apiUrl)
        console.log('[Get User Summary API] Full URL:', window.location.origin + apiUrl)
        console.log('[Get User Summary API] Request Method: GET')
        console.log('[Get User Summary API] User ID:', userId)
        console.log('[Get User Summary API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Get User Summary API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Get User Summary API] ===== Response Details =====')
        console.log('[Get User Summary API] Response status:', response.status)
        console.log('[Get User Summary API] Content-Type:', contentType)
        console.log('[Get User Summary API] Response text:', responseText)
        console.log('[Get User Summary API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                const errorMessage = errorData.message || errorData.error || '잘못된 요청입니다.'
                console.error('[Get User Summary API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 401 Unauthorized 에러 처리
            if (response.status === 401) {
                const errorMessage = errorData.message || errorData.error || '인증이 필요합니다.'
                console.error('[Get User Summary API] 401 Unauthorized:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '요약 정보를 찾을 수 없습니다.'
                console.error('[Get User Summary API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `사용자 요약 정보 조회에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 (200 OK)
        let responseData
        try {
            responseData = JSON.parse(responseText)
        } catch (parseError) {
            throw new Error('서버 응답을 파싱할 수 없습니다.')
        }

        console.log('[Get User Summary API] 사용자 요약 정보 조회가 성공적으로 완료되었습니다.')
        return responseData
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}
