/**
 * 인증 관련 API 유틸리티
 */

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

