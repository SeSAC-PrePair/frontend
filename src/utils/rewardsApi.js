/**
 * 리워드 조회 API 유틸리티
 */

/**
 * 사용자의 리워드를 조회합니다.
 * @returns {Promise<Object>} 리워드 응답 객체
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getUserRewards() {
    const apiUrl = `/api/users/me/rewards`
    
    try {
        const requestHeaders = {
            'Accept': 'application/json',
        }
        
        console.log('[Rewards API] ===== Request Details =====')
        console.log('[Rewards API] Request URL:', apiUrl)
        console.log('[Rewards API] Request Method: GET')
        console.log('[Rewards API] Request headers:', requestHeaders)
        console.log('[Rewards API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Rewards API] ===== Response Details =====')
        console.log('[Rewards API] Response status:', response.status)
        console.log('[Rewards API] Content-Type:', contentType)
        console.log('[Rewards API] Response text:', responseText)
        console.log('[Rewards API] =============================')
        
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

            // 401 Unauthorized 에러 처리
            if (response.status === 401) {
                const errorMessage = errorData.message || errorData.error || '인증이 필요합니다. 다시 로그인해주세요.'
                console.error('[Rewards API] 401 Unauthorized:', errorMessage)
                throw new Error(errorMessage)
            }

            // 403 Forbidden 에러 처리
            if (response.status === 403) {
                const errorMessage = errorData.message || errorData.error || '리워드 조회 권한이 없습니다.'
                console.error('[Rewards API] 403 Forbidden:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '리워드 정보를 찾을 수 없습니다.'
                console.error('[Rewards API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            // 405 Method Not Allowed 에러 처리 (서버가 GET 메서드를 지원하지 않는 경우)
            if (response.status === 405) {
                const errorMessage = errorData.message || errorData.error || 'GET 메서드가 지원되지 않습니다.'
                console.warn('[Rewards API] 405 Method Not Allowed:', errorMessage)
                console.warn('[Rewards API] 백엔드 서버가 /api/users/me/rewards 엔드포인트에서 GET 메서드를 지원하지 않을 수 있습니다.')
                throw new Error('GET_METHOD_NOT_ALLOWED')
            }

            // 500 Internal Server Error 처리
            if (response.status === 500) {
                const errorMessage = errorData.message || errorData.error || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                console.error('[Rewards API] 500 Internal Server Error:', errorMessage)
                console.error('[Rewards API] Full error data:', errorData)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `리워드 조회에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            throw new Error('서버에서 빈 응답을 받았습니다.')
        }

        let data
        try {
            data = JSON.parse(responseText)
            
            // 서버 응답 구조 확인 및 로깅
            console.log('[Rewards API] ===== Parsed Response Data =====')
            console.log('[Rewards API] Full response object:', data)
            console.log('[Rewards API] Response keys:', Object.keys(data))
            console.log('[Rewards API] ======================================')
            
        } catch (parseError) {
            console.error('[Rewards API] JSON parse error:', parseError)
            console.error('[Rewards API] Response text:', responseText)
            console.error('[Rewards API] Content-Type:', contentType)
            
            // Content-Type이 JSON이 아닌 경우 (HTML이 반환된 경우 - API 엔드포인트가 없거나 프록시 문제)
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    console.error('[Rewards API] HTML 응답이 반환되었습니다. API 엔드포인트가 존재하지 않거나 프록시 설정을 확인해주세요.')
                    console.error('[Rewards API] 요청 URL:', apiUrl)
                    throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
                }
                throw new Error(`서버가 JSON 형식이 아닌 응답을 반환했습니다. (Content-Type: ${contentType})`)
            }
            
            throw new Error(`서버 응답을 파싱할 수 없습니다: ${parseError.message}`)
        }

        return data
    } catch (error) {
        // 네트워크 에러 등 기타 에러 처리
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
        
        // 이미 처리된 에러는 그대로 throw
        throw error
    }
}








