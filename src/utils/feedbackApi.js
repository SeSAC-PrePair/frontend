/**
 * 피드백 생성 API 유틸리티
 */

/**
 * 질문에 대한 피드백을 생성합니다.
 * @param {string} historyId - 히스토리 ID (예: "h-004")
 * @param {Object} payload - 요청 페이로드
 * @param {string} payload.question - 질문 내용
 * @param {string} payload.answer - 답변 내용
 * @returns {Promise<Object>} 피드백 응답 객체 (응답에서 user-id 포함)
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function generateFeedback(historyId, payload) {
    // payload 자체 검증
    if (!payload || typeof payload !== 'object') {
        throw new Error('요청 데이터가 올바르지 않습니다.')
    }

    const { question, answer } = payload

    // 디버깅: payload 내용 확인
    console.log('[Feedback API] Payload received:', {
        hasQuestion: 'question' in payload,
        hasAnswer: 'answer' in payload,
        questionType: typeof question,
        answerType: typeof answer,
        questionValue: question,
        answerValue: answer,
    })

    // 필수 파라미터 검증
    if (!question || typeof question !== 'string' || !question.trim()) {
        console.error('[Feedback API] Question validation failed:', { question, type: typeof question })
        throw new Error('질문이 없습니다. 다시 확인해주세요.')
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
        console.error('[Feedback API] Answer validation failed:', { answer, type: typeof answer })
        throw new Error('답변이 없습니다. 다시 확인해주세요.')
    }

    if (!historyId) {
        throw new Error('히스토리 ID가 필요합니다.')
    }

    const apiUrl = `/api/evaluation/feedback/${historyId}`
    
    try {
        const trimmedQuestion = question.trim()
        const trimmedAnswer = answer.trim()
        
        // 추가 검증: 빈 문자열 체크
        if (!trimmedQuestion) {
            throw new Error('질문이 비어있습니다. 다시 확인해주세요.')
        }
        
        if (!trimmedAnswer) {
            throw new Error('답변이 비어있습니다. 다시 확인해주세요.')
        }
        
        // 서버 스펙에 맞는 요청 본문 생성
        // API 문서에 따르면: { question: string, answer: string }
        // 명시적으로 객체를 생성하여 서버가 파싱할 수 있도록 함
        const requestBody = {
            question: String(trimmedQuestion),
            answer: String(trimmedAnswer),
        }
        
        // 디버깅: 요청 본문 생성 직후 확인
        console.log('[Feedback API] ===== Request Body Creation =====')
        console.log('[Feedback API] trimmedQuestion:', trimmedQuestion)
        console.log('[Feedback API] trimmedQuestion type:', typeof trimmedQuestion)
        console.log('[Feedback API] trimmedQuestion length:', trimmedQuestion?.length)
        console.log('[Feedback API] trimmedAnswer length:', trimmedAnswer?.length)
        console.log('[Feedback API] requestBody before stringify:', requestBody)
        console.log('[Feedback API] requestBody.question:', requestBody.question)
        console.log('[Feedback API] requestBody.question type:', typeof requestBody.question)
        console.log('[Feedback API] requestBody.question length:', requestBody.question?.length)
        console.log('[Feedback API] ==================================')
        
        // JSON 직렬화 (서버가 기대하는 형식과 정확히 일치하도록)
        const requestBodyString = JSON.stringify(requestBody, null, 0)
        
        // 디버깅: JSON 직렬화 후 확인
        console.log('[Feedback API] ===== After JSON Stringify =====')
        console.log('[Feedback API] requestBodyString:', requestBodyString)
        console.log('[Feedback API] Parsed back:', JSON.parse(requestBodyString))
        console.log('[Feedback API] ================================')
        
        // 최종 요청 본문 검증
        let parsedBody
        try {
            parsedBody = JSON.parse(requestBodyString)
        } catch (parseErr) {
            console.error('[Feedback API] Failed to parse request body:', parseErr)
            throw new Error('요청 본문 생성에 실패했습니다.')
        }
        
        // 필드 존재 여부 및 값 확인
        const hasQuestion = 'question' in parsedBody && parsedBody.question != null && parsedBody.question !== ''
        const hasAnswer = 'answer' in parsedBody && parsedBody.answer != null && parsedBody.answer !== ''
    
        
        // 필드 검증 실패 시 에러
        if (!hasQuestion || !hasAnswer) {
            console.error('[Feedback API] Validation failed - missing fields:', {
                hasQuestion,
                hasAnswer,
                questionValue: parsedBody.question,
                answerValue: parsedBody.answer?.substring(0, 50),
            })
            throw new Error(`요청 데이터가 올바르지 않습니다. 질문: ${hasQuestion}, 답변: ${hasAnswer}`)
        }
        
        console.log('[Feedback API] ===========================')
        
        // POST 요청 전송 (서버 스펙에 맞는 형식)
        // API 문서에 따라 명시적으로 Content-Type 설정
        const requestHeaders = {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
        }
        
        console.log('[Feedback API] Request headers:', requestHeaders)
        console.log('[Feedback API] Sending request with body:', requestBodyString.substring(0, 200) + '...')
        
        // 최종 요청 본문을 다시 파싱하여 확인
        let finalBodyCheck
        try {
            finalBodyCheck = JSON.parse(requestBodyString)
            console.log('[Feedback API] ===== Final Body Check Before Send =====')
            console.log('[Feedback API] Full request body (string):', requestBodyString)
            console.log('[Feedback API] Parsed request body:', finalBodyCheck)
            console.log('[Feedback API] Has question field:', 'question' in finalBodyCheck)
            console.log('[Feedback API] Has answer field:', 'answer' in finalBodyCheck)
            console.log('[Feedback API] Question value:', finalBodyCheck.question)
            console.log('[Feedback API] Question type:', typeof finalBodyCheck.question)
            console.log('[Feedback API] Question length:', finalBodyCheck.question?.length)
            console.log('[Feedback API] Answer value (first 100 chars):', finalBodyCheck.answer?.substring(0, 100) + '...')
            console.log('[Feedback API] Answer type:', typeof finalBodyCheck.answer)
            console.log('[Feedback API] Answer length:', finalBodyCheck.answer?.length)
            console.log('[Feedback API] All keys in body:', Object.keys(finalBodyCheck))
            console.log('[Feedback API] Body keys count:', Object.keys(finalBodyCheck).length)
            console.log('[Feedback API] ==========================================')
        } catch (e) {
            console.error('[Feedback API] Failed to parse final body:', e)
        }
        
        // 실제 fetch 요청 직전에 최종 확인
        console.log('[Feedback API] ===== Final Check Before Fetch =====')
        console.log('[Feedback API] About to send fetch request to:', apiUrl)
        console.log('[Feedback API] Method: POST')
        console.log('[Feedback API] Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Feedback API] Body length:', requestBodyString.length)
        console.log('[Feedback API] Body (full):', requestBodyString)
        
        // 최종 body 파싱 확인
        const finalCheck = JSON.parse(requestBodyString)
        console.log('[Feedback API] Final body parsed:', finalCheck)
        console.log('[Feedback API] Final body.question:', finalCheck.question)
        console.log('[Feedback API] Final body.question length:', finalCheck.question?.length)
        console.log('[Feedback API] Final body.answer length:', finalCheck.answer?.length)
        console.log('[Feedback API] =====================================')
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: requestBodyString,
            credentials: 'include', // 쿠키 포함
        })
        
        // 요청이 실제로 전송되었는지 확인
        console.log('[Feedback API] Fetch completed, response status:', response.status)

        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅을 위한 로그
        console.log('[Feedback API] ===== Response Details =====')
        console.log('[Feedback API] Response status:', response.status)
        console.log('[Feedback API] Content-Type:', contentType)
        console.log('[Feedback API] Response text (full):', responseText)
        console.log('[Feedback API] =============================')
        
        if (!response.ok) {
            let errorData
            try {
                if (responseText.trim()) {
                    errorData = JSON.parse(responseText)
                    console.error('[Feedback API] Error response data:', errorData)
                } else {
                    errorData = { message: '서버에서 빈 응답을 받았습니다.' }
                }
            } catch (parseError) {
                console.error('[Feedback API] Error response parse failed:', parseError)
                console.error('[Feedback API] Raw response:', responseText)
                errorData = { 
                    message: responseText || `서버 오류가 발생했습니다. (${response.status} ${response.statusText})` 
                }
            }

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                // 에러 응답 형식: { message, error, statusCode }
                const errorMessage = errorData.message || errorData.error || '질문이 없습니다. 다시 확인해주세요.'
                
                // 상세한 디버깅 정보 출력
                console.error('[Feedback API] ===== 400 Bad Request Error Details =====')
                console.error('[Feedback API] Error message:', errorMessage)
                console.error('[Feedback API] Error object:', errorData.error)
                console.error('[Feedback API] Status code:', errorData.statusCode)
                console.error('[Feedback API] Full error data:', errorData)
                console.error('[Feedback API] Raw response text:', responseText)
                console.error('[Feedback API] Request URL:', apiUrl)
                console.error('[Feedback API] Request payload sent:', {
                    question: requestBody.question,
                    answer: requestBody.answer?.substring(0, 100) + '...',
                    questionLength: requestBody.question?.length,
                    answerLength: requestBody.answer?.length,
                    questionExists: !!requestBody.question,
                    answerExists: !!requestBody.answer,
                })
                console.error('[Feedback API] =========================================')
                
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `피드백 생성에 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            console.error('[Feedback API] Empty response received')
            throw new Error('서버에서 빈 응답을 받았습니다.')
        }

        let data
        try {
            data = JSON.parse(responseText)
            
            // 서버 응답 구조 확인 및 로깅
            console.log('[Feedback API] ===== Parsed Response Data =====')
            console.log('[Feedback API] Full response object:', data)
            console.log('[Feedback API] Response keys:', Object.keys(data))
            console.log('[Feedback API] Has feedback field:', 'feedback' in data)
            console.log('[Feedback API] Feedback type:', typeof data.feedback)
            console.log('[Feedback API] Feedback value:', data.feedback)
            
            if (data.feedback) {
                if (typeof data.feedback === 'string') {
                    console.warn('[Feedback API] ⚠️ WARNING: feedback is a string, not an object!')
                    console.warn('[Feedback API] Expected format: { good: "...", improvement: "...", recommendation: "..." }')
                    console.warn('[Feedback API] Actual format: string')
                    console.warn('[Feedback API] Feedback string value:', data.feedback)
                } else if (typeof data.feedback === 'object') {
                    console.log('[Feedback API] ✓ feedback is an object')
                    console.log('[Feedback API] Feedback object keys:', Object.keys(data.feedback))
                    console.log('[Feedback API] Has good field:', 'good' in data.feedback)
                    console.log('[Feedback API] Has improvement field:', 'improvement' in data.feedback)
                    console.log('[Feedback API] Has recommendation field:', 'recommendation' in data.feedback)
                    console.log('[Feedback API] Good value:', data.feedback.good)
                    console.log('[Feedback API] Improvement value:', data.feedback.improvement)
                    console.log('[Feedback API] Recommendation value:', data.feedback.recommendation)
                }
            } else {
                console.warn('[Feedback API] ⚠️ WARNING: feedback field is missing or null!')
            }
            
            console.log('[Feedback API] Score:', data.score)
            console.log('[Feedback API] Status:', data.status)
            
            // 응답에서 user-id 추출 및 로깅
            const userId = data.user_id || data['user-id']
            if (userId) {
                console.log('[Feedback API] User ID from response:', userId)
            } else {
                console.warn('[Feedback API] ⚠️ WARNING: user-id not found in response')
            }
            
            console.log('[Feedback API] ======================================')
            
        } catch (parseError) {
            console.error('[Feedback API] JSON parse error:', parseError)
            console.error('[Feedback API] Response text:', responseText)
            console.error('[Feedback API] Content-Type:', contentType)
            
            // Content-Type이 JSON이 아닌 경우 (HTML이 반환된 경우 - API 엔드포인트가 없거나 프록시 문제)
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    console.error('[Feedback API] HTML 응답이 반환되었습니다. API 엔드포인트가 존재하지 않거나 프록시 설정을 확인해주세요.')
                    console.error('[Feedback API] 요청 URL:', apiUrl)
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

/**
 * 질문에 대한 추천 답안을 가져옵니다.
 * @param {Object} payload - 요청 페이로드
 * @param {string} payload.question - 질문 내용
 * @returns {Promise<Object>} 추천 답안 응답 객체 { question, answer }
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getSuggestedAnswer(payload) {
    // payload 자체 검증
    if (!payload || typeof payload !== 'object') {
        throw new Error('요청 데이터가 올바르지 않습니다.')
    }

    const { question } = payload

    // 필수 파라미터 검증
    if (!question || typeof question !== 'string' || !question.trim()) {
        throw new Error('질문이 없습니다. 다시 확인해주세요.')
    }

    const apiUrl = `/api/evaluation/feedback`
    
    try {
        const trimmedQuestion = question.trim()
        
        // 서버 스펙에 맞는 요청 본문 생성
        const requestBody = {
            question: String(trimmedQuestion),
        }
        
        const requestBodyString = JSON.stringify(requestBody, null, 0)
        
        const requestHeaders = {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Suggested Answer API] ===== Request Details =====')
        console.log('[Suggested Answer API] Request URL:', apiUrl)
        console.log('[Suggested Answer API] Request Method: POST')
        console.log('[Suggested Answer API] Request payload:', requestBody)
        console.log('[Suggested Answer API] Request body string:', requestBodyString)
        console.log('[Suggested Answer API] ===========================')
        
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
        console.log('[Suggested Answer API] ===== Response Details =====')
        console.log('[Suggested Answer API] Response status:', response.status)
        console.log('[Suggested Answer API] Content-Type:', contentType)
        console.log('[Suggested Answer API] Response text:', responseText)
        console.log('[Suggested Answer API] =============================')
        
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
                const errorMessage = errorData.message || errorData.error || '질문이 없습니다. 다시 확인해주세요.'
                console.error('[Suggested Answer API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 500 Internal Server Error 처리
            if (response.status === 500) {
                const errorMessage = errorData.message || errorData.error || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                console.error('[Suggested Answer API] 500 Internal Server Error:', errorMessage)
                console.error('[Suggested Answer API] Full error data:', errorData)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `추천 답안을 가져오는데 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            throw new Error('서버에서 빈 응답을 받았습니다.')
        }

        let data
        try {
            data = JSON.parse(responseText)
        } catch (parseError) {
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
                }
                throw new Error(`서버가 JSON 형식이 아닌 응답을 반환했습니다. (Content-Type: ${contentType})`)
            }
            throw new Error(`서버 응답을 파싱할 수 없습니다: ${parseError.message}`)
        }

        // 응답 형식 검증: { question, answer } 또는 { answer } 형식 모두 처리
        if (!data.answer) {
            throw new Error('서버 응답에 답안이 포함되어 있지 않습니다.')
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

/**
 * 사용자의 요약 피드백을 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 요약 피드백 응답 객체
 * @property {Object} scores - 6가지 역량 점수
 * @property {number} scores.proactivity - 적극성
 * @property {number} scores.logicalThinking - 논리적사고
 * @property {number} scores.creativity - 창의력
 * @property {number} scores.careerValues - 직업관
 * @property {number} scores.cooperation - 협동성
 * @property {number} scores.coreValues - 가치관
 * @property {string} strengths - 강점
 * @property {string} improvements - 개선이 필요한 부분
 * @property {string} recommendations - 추천 학습
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getSummaryFeedback(userId) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    const apiUrl = `/api/evaluation/feedback/${userId.trim()}`
    
    try {
        const requestHeaders = {
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Summary Feedback API] ===== Request Details =====')
        console.log('[Summary Feedback API] Request URL:', apiUrl)
        console.log('[Summary Feedback API] Request Method: GET')
        console.log('[Summary Feedback API] User ID:', userId)
        console.log('[Summary Feedback API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Summary Feedback API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Summary Feedback API] ===== Response Details =====')
        console.log('[Summary Feedback API] Response status:', response.status)
        console.log('[Summary Feedback API] Content-Type:', contentType)
        console.log('[Summary Feedback API] Response text:', responseText)
        console.log('[Summary Feedback API] =============================')
        
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
                console.error('[Summary Feedback API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '요약 데이터를 찾을 수 없습니다.'
                console.error('[Summary Feedback API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            // 500 Internal Server Error 처리
            if (response.status === 500) {
                const errorMessage = errorData.message || errorData.error || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                console.error('[Summary Feedback API] 500 Internal Server Error:', errorMessage)
                console.error('[Summary Feedback API] Full error data:', errorData)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `요약 피드백을 가져오는데 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            throw new Error('서버에서 빈 응답을 받았습니다.')
        }

        let data
        try {
            data = JSON.parse(responseText)
        } catch (parseError) {
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
                }
                throw new Error(`서버가 JSON 형식이 아닌 응답을 반환했습니다. (Content-Type: ${contentType})`)
            }
            throw new Error(`서버 응답을 파싱할 수 없습니다: ${parseError.message}`)
        }

        // 응답 형식 검증
        if (!data.scores || typeof data.scores !== 'object') {
            throw new Error('서버 응답에 점수 데이터가 포함되어 있지 않습니다.')
        }

        // 필수 필드 검증
        const requiredScoreFields = ['proactivity', 'logicalThinking', 'creativity', 'careerValues', 'cooperation', 'coreValues']
        const missingFields = requiredScoreFields.filter(field => !(field in data.scores))
        if (missingFields.length > 0) {
            console.warn('[Summary Feedback API] Missing score fields:', missingFields)
        }

        // 응답 데이터 로깅
        console.log('[Summary Feedback API] ===== Parsed Response Data =====')
        console.log('[Summary Feedback API] Scores:', data.scores)
        console.log('[Summary Feedback API] Strengths:', data.strengths?.substring(0, 100) + '...')
        console.log('[Summary Feedback API] Improvements:', data.improvements?.substring(0, 100) + '...')
        console.log('[Summary Feedback API] Recommendations:', data.recommendations?.substring(0, 100) + '...')
        console.log('[Summary Feedback API] ======================================')

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

/**
 * 오늘의 질문을 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 오늘의 질문 응답 객체
 * @property {number} question_id - 질문 ID
 * @property {string} question - 질문 내용
 * @property {string} created_at - 생성 시간
 * @property {string} answered_at - 답변 시간 (null일 수 있음)
 * @property {string} status - 상태 ("UNANSWERED" 또는 "ANSWERED")
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getTodayQuestion(userId) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    const apiUrl = `/api/interviews/me/today`
    
    try {
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Today Question API] ===== Request Details =====')
        console.log('[Today Question API] Request URL:', apiUrl)
        console.log('[Today Question API] Request Method: GET')
        console.log('[Today Question API] User ID:', userId)
        console.log('[Today Question API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Today Question API] X-User-ID header:', requestHeaders['X-User-ID'])
        console.log('[Today Question API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 요청이 실제로 전송되었는지 확인
        console.log('[Today Question API] Request sent with headers:', requestHeaders)
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Today Question API] ===== Response Details =====')
        console.log('[Today Question API] Response status:', response.status)
        console.log('[Today Question API] Content-Type:', contentType)
        console.log('[Today Question API] Response text:', responseText)
        console.log('[Today Question API] =============================')
        
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

            // 상세한 에러 로깅
            console.error('[Today Question API] ===== Error Details =====')
            console.error('[Today Question API] Status:', response.status)
            console.error('[Today Question API] Status Text:', response.statusText)
            console.error('[Today Question API] Response Text:', responseText)
            console.error('[Today Question API] Parsed Error Data:', errorData)
            console.error('[Today Question API] Error Data Keys:', Object.keys(errorData))
            console.error('[Today Question API] Request Headers Sent:', requestHeaders)
            console.error('[Today Question API] User ID Used:', userId)
            console.error('[Today Question API] ===========================')

            // 400 Bad Request 에러 처리
            if (response.status === 400) {
                const errorMessage = errorData.message || errorData.error || errorData.errorMessage || '잘못된 요청입니다.'
                console.error('[Today Question API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || errorData.errorMessage || '오늘의 질문을 찾을 수 없습니다.'
                console.error('[Today Question API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            // 500 Internal Server Error 처리
            if (response.status === 500) {
                // 에러 메시지 추출 시도 (다양한 필드명 확인)
                const errorMessage = errorData.message 
                    || errorData.error 
                    || errorData.errorMessage 
                    || errorData.detail
                    || errorData.msg
                    || (typeof errorData === 'string' ? errorData : '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
                
                console.error('[Today Question API] 500 Internal Server Error:', errorMessage)
                console.error('[Today Question API] Full error data:', JSON.stringify(errorData, null, 2))
                console.error('[Today Question API] Error data type:', typeof errorData)
                console.error('[Today Question API] Raw response text:', responseText)
                
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                errorData.error ||
                errorData.errorMessage ||
                `오늘의 질문을 가져오는데 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            throw new Error('서버에서 빈 응답을 받았습니다.')
        }

        let data
        try {
            data = JSON.parse(responseText)
        } catch (parseError) {
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
                }
                throw new Error(`서버가 JSON 형식이 아닌 응답을 반환했습니다. (Content-Type: ${contentType})`)
            }
            throw new Error(`서버 응답을 파싱할 수 없습니다: ${parseError.message}`)
        }

        // 응답 형식 검증
        if (!data.question_id && !data.question) {
            throw new Error('서버 응답에 질문 데이터가 포함되어 있지 않습니다.')
        }

        // 응답 데이터 로깅
        console.log('[Today Question API] ===== Parsed Response Data =====')
        console.log('[Today Question API] Question ID:', data.question_id)
        console.log('[Today Question API] Question:', data.question?.substring(0, 100) + '...')
        console.log('[Today Question API] Status:', data.status)
        console.log('[Today Question API] Created At:', data.created_at)
        console.log('[Today Question API] Answered At:', data.answered_at)
        console.log('[Today Question API] ======================================')

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

/**
 * 과거 질문 목록을 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Array>} 과거 질문 목록 배열
 * @property {number} question_id - 질문 ID
 * @property {string} question - 질문 내용
 * @property {string} created_at - 생성 시간
 * @property {string} answered_at - 답변 시간 (null일 수 있음)
 * @property {string} status - 상태 ("UNANSWERED" 또는 "ANSWERED")
 * @property {number} score - 점수 (null일 수 있음)
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getInterviewHistories(userId) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    const apiUrl = `/api/interviews/me/histories`
    
    try {
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Interview Histories API] ===== Request Details =====')
        console.log('[Interview Histories API] Request URL:', apiUrl)
        console.log('[Interview Histories API] Request Method: GET')
        console.log('[Interview Histories API] User ID:', userId)
        console.log('[Interview Histories API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Interview Histories API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Interview Histories API] ===== Response Details =====')
        console.log('[Interview Histories API] Response status:', response.status)
        console.log('[Interview Histories API] Content-Type:', contentType)
        console.log('[Interview Histories API] Response text:', responseText)
        console.log('[Interview Histories API] =============================')
        
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
                console.error('[Interview Histories API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '과거 질문을 찾을 수 없습니다.'
                console.error('[Interview Histories API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            // 500 Internal Server Error 처리
            if (response.status === 500) {
                const errorMessage = errorData.message || errorData.error || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                console.error('[Interview Histories API] 500 Internal Server Error:', errorMessage)
                console.error('[Interview Histories API] Full error data:', errorData)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `과거 질문 목록을 가져오는데 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            // 빈 배열 반환 (과거 질문이 없는 경우)
            return []
        }

        let data
        try {
            data = JSON.parse(responseText)
        } catch (parseError) {
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
                }
                throw new Error(`서버가 JSON 형식이 아닌 응답을 반환했습니다. (Content-Type: ${contentType})`)
            }
            throw new Error(`서버 응답을 파싱할 수 없습니다: ${parseError.message}`)
        }

        // 응답이 배열인지 확인
        if (!Array.isArray(data)) {
            console.warn('[Interview Histories API] Response is not an array, converting to array')
            return Array.isArray(data) ? data : []
        }

        // 응답 데이터 로깅
        console.log('[Interview Histories API] ===== Parsed Response Data =====')
        console.log('[Interview Histories API] Histories count:', data.length)
        console.log('[Interview Histories API] First history:', data[0])
        console.log('[Interview Histories API] ======================================')

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

/**
 * 특정 질문의 상세 피드백을 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @param {string} historyId - 히스토리 ID (예: "q_1226")
 * @returns {Promise<Object>} 상세 피드백 응답 객체
 * @property {string} history_id - 히스토리 ID
 * @property {string} question_id - 질문 ID
 * @property {string} question - 질문 내용
 * @property {string} date - 날짜
 * @property {string} answer - 답변 내용
 * @property {number} score - 점수
 * @property {Object} feedback - 피드백 객체
 * @property {string} feedback.good - 잘한 점
 * @property {string} feedback.improvement - 개선이 필요한 점
 * @property {string} feedback.recommendation - 추천 학습
 * @property {number} point - 획득 포인트 (null일 수 있음)
 * @throws {Error} API 호출 실패 시 에러 발생
 */
export async function getInterviewHistoryDetail(userId, historyId) {
    // userId 검증
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error('사용자 ID가 필요합니다.')
    }

    // historyId 검증
    if (!historyId || typeof historyId !== 'string' || !historyId.trim()) {
        throw new Error('히스토리 ID가 필요합니다.')
    }

    // 서버 스펙: /api/interviews/me/histories/{historyId} 형태의 path parameter 사용
    const apiUrl = `/api/interviews/me/histories/${encodeURIComponent(historyId.trim())}`
    
    try {
        const requestHeaders = {
            'X-User-ID': userId.trim(),
            'Accept': 'application/json',
        }
        
        // 디버깅 로그
        console.log('[Interview History Detail API] ===== Request Details =====')
        console.log('[Interview History Detail API] Request URL:', apiUrl)
        console.log('[Interview History Detail API] Request Method: GET')
        console.log('[Interview History Detail API] User ID:', userId)
        console.log('[Interview History Detail API] History ID:', historyId)
        console.log('[Interview History Detail API] Request Headers:', JSON.stringify(requestHeaders, null, 2))
        console.log('[Interview History Detail API] ===========================')
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: requestHeaders,
            credentials: 'include', // 쿠키 포함
        })
        
        // 응답이 JSON이 아닐 수 있으므로 먼저 텍스트로 읽기
        const responseText = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        // 디버깅 로그
        console.log('[Interview History Detail API] ===== Response Details =====')
        console.log('[Interview History Detail API] Response status:', response.status)
        console.log('[Interview History Detail API] Content-Type:', contentType)
        console.log('[Interview History Detail API] Response text:', responseText)
        console.log('[Interview History Detail API] =============================')
        
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
                console.error('[Interview History Detail API] 400 Bad Request:', errorMessage)
                throw new Error(errorMessage)
            }

            // 404 Not Found 에러 처리
            if (response.status === 404) {
                const errorMessage = errorData.message || errorData.error || '상세 피드백을 찾을 수 없습니다.'
                console.error('[Interview History Detail API] 404 Not Found:', errorMessage)
                throw new Error(errorMessage)
            }

            // 500 Internal Server Error 처리
            if (response.status === 500) {
                const errorMessage = errorData.message || errorData.error || '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                console.error('[Interview History Detail API] 500 Internal Server Error:', errorMessage)
                console.error('[Interview History Detail API] Full error data:', errorData)
                throw new Error(errorMessage)
            }

            throw new Error(
                errorData.message || 
                `상세 피드백을 가져오는데 실패했습니다. (${response.status} ${response.statusText})`
            )
        }

        // 성공 응답 파싱
        if (!responseText || !responseText.trim()) {
            throw new Error('서버에서 빈 응답을 받았습니다.')
        }

        let data
        try {
            data = JSON.parse(responseText)
        } catch (parseError) {
            if (!contentType.includes('application/json')) {
                if (contentType.includes('text/html')) {
                    throw new Error('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
                }
                throw new Error(`서버가 JSON 형식이 아닌 응답을 반환했습니다. (Content-Type: ${contentType})`)
            }
            throw new Error(`서버 응답을 파싱할 수 없습니다: ${parseError.message}`)
        }

        // 응답 형식 검증
        if (!data.question && !data.question_id) {
            throw new Error('서버 응답에 질문 데이터가 포함되어 있지 않습니다.')
        }

        // 응답 데이터 로깅
        console.log('[Interview History Detail API] ===== Parsed Response Data =====')
        console.log('[Interview History Detail API] Full response object:', data)
        console.log('[Interview History Detail API] Response keys:', Object.keys(data))
        console.log('[Interview History Detail API] History ID:', data.history_id)
        console.log('[Interview History Detail API] Question ID:', data.question_id)
        console.log('[Interview History Detail API] Question:', data.question?.substring(0, 100) + '...')
        console.log('[Interview History Detail API] Answer:', data.answer?.substring(0, 100) + '...')
        console.log('[Interview History Detail API] Score:', data.score)
        console.log('[Interview History Detail API] Feedback:', data.feedback)
        console.log('[Interview History Detail API] Feedback type:', typeof data.feedback)
        if (data.feedback && typeof data.feedback === 'object') {
            console.log('[Interview History Detail API] Feedback keys:', Object.keys(data.feedback))
            console.log('[Interview History Detail API] Feedback.good:', data.feedback.good)
            console.log('[Interview History Detail API] Feedback.improvement:', data.feedback.improvement)
            console.log('[Interview History Detail API] Feedback.recommendation:', data.feedback.recommendation)
        }
        console.log('[Interview History Detail API] ======================================')

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

