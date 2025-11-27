/**
 * 워크넷 오픈 API 유틸리티
 * 개인회원은 공채속보, 공채기업정보, 채용행사 API만 사용 가능
 */

// 공채기업정보 API (개인회원 사용 가능)
const WORKNET_PUBLIC_COMPANY_API_URL = 'https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L21.do'

// 일반 채용정보 API (기업회원만 사용 가능)
const WORKNET_GENERAL_API_URL = 'https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do'

/**
 * 공채기업정보 API XML 응답을 파싱하여 채용정보 배열로 변환
 * @param {string} xmlString - XML 응답 문자열
 * @returns {Array} 채용정보 배열
 */
function parsePublicCompanyXML(xmlString) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
    
    // 에러 체크
    const errorNode = xmlDoc.querySelector('error') || 
                     xmlDoc.querySelector('result') || 
                     xmlDoc.querySelector('message')
    
    if (errorNode) {
        const errorMsg = errorNode.textContent || '알 수 없는 오류가 발생했습니다.'
        throw new Error(errorMsg)
    }
    
    // 공채기업정보 API는 <dhsOpenEmpInfoList> 구조
    const empInfoItems = xmlDoc.querySelectorAll('dhsOpenEmpInfo')
    const jobPostings = []
    
    empInfoItems.forEach((empInfo) => {
        const getTextContent = (tagName) => {
            const element = empInfo.querySelector(tagName)
            return element ? element.textContent.trim() : ''
        }
        
        jobPostings.push({
            empSeqno: getTextContent('empSeqno'),
            empWantedTitle: getTextContent('empWantedTitle'),
            empBusiNm: getTextContent('empBusiNm'),
            coClcdNm: getTextContent('coClcdNm'),
            empWantedStdt: getTextContent('empWantedStdt'),
            empWantedEndt: getTextContent('empWantedEndt'),
            empWantedTypeNm: getTextContent('empWantedTypeNm'),
            regLogImgNm: getTextContent('regLogImgNm'),
            empWantedHomepgDetail: getTextContent('empWantedHomepgDetail'),
            empWantedMobileUrl: getTextContent('empWantedMobileUrl'),
            // 공채기업정보를 일반 채용정보 형식으로 변환
            company: getTextContent('empBusiNm'), // 채용업체명
            title: getTextContent('empWantedTitle'), // 채용제목
            type: getTextContent('empWantedTypeNm'), // 고용형태
            region: getTextContent('coClcdNm'), // 기업구분명
        })
    })
    
    return jobPostings
}

/**
 * 일반 채용정보 API XML 응답을 파싱하여 채용정보 배열로 변환
 * @param {string} xmlString - XML 응답 문자열
 * @returns {Array} 채용정보 배열
 */
function parseGeneralJobXML(xmlString) {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
    
    // 에러 체크
    const errorNode = xmlDoc.querySelector('error') || 
                     xmlDoc.querySelector('result') || 
                     xmlDoc.querySelector('message')
    
    if (errorNode) {
        const errorMsg = errorNode.textContent || '알 수 없는 오류가 발생했습니다.'
        throw new Error(errorMsg)
    }
    
    const wantedItems = xmlDoc.querySelectorAll('wanted')
    const jobPostings = []
    
    wantedItems.forEach((wanted) => {
        const getTextContent = (tagName) => {
            const element = wanted.querySelector(tagName)
            return element ? element.textContent.trim() : ''
        }
        
        jobPostings.push({
            wantedAuthNo: getTextContent('wantedAuthNo'),
            company: getTextContent('company'),
            title: getTextContent('title'),
            salTpNm: getTextContent('salTpNm'),
            sal: getTextContent('sal'),
            region: getTextContent('region'),
            holidayTpNm: getTextContent('holidayTpNm'),
            minEdubg: getTextContent('minEdubg'),
            maxEdubg: getTextContent('maxEdubg'),
            career: getTextContent('career'),
            regDt: getTextContent('regDt'),
            closeDt: getTextContent('closeDt'),
            wantedInfoUrl: getTextContent('wantedInfoUrl'),
            wantedMobileInfoUrl: getTextContent('wantedMobileInfoUrl'),
            empTpCd: getTextContent('empTpCd'),
        })
    })
    
    return jobPostings
}

/**
 * 워크넷 공채기업정보 API에서 채용정보 목록을 가져옵니다 (개인회원 사용 가능)
 * @param {Object} options - API 호출 옵션
 * @param {string} options.authKey - 인증키 (필수)
 * @param {number} options.startPage - 시작 페이지 (기본값: 1)
 * @param {number} options.display - 출력 건수 (기본값: 10, 최대: 100)
 * @param {string} options.empCoNo - 채용기업번호 (선택)
 * @param {string} options.coClcd - 기업구분코드 (선택: 10,20,30,40,50)
 * @param {string} options.empWantedTypeCd - 고용형태 (선택: 10,20,30,40,50,60)
 * @param {string} options.empWantedCareerCd - 경력구분 (선택: 10,20,30,40)
 * @param {string} options.jobsCd - 직종코드 (선택)
 * @param {string} options.empWantedTitle - 채용제목 (선택)
 * @param {string} options.empWantedEduCd - 학력 (선택: 10,20,30,40,50,99)
 * @param {string} options.sortField - 정렬필드 (선택: regDt, coNm)
 * @param {string} options.sortOrderBy - 정렬방식 (선택: desc, asc)
 * @param {string} options.busino - 사업자번호 (선택)
 * @returns {Promise<Array>} 채용정보 배열
 */
export async function fetchJobPostings(options = {}) {
    const {
        authKey = import.meta.env.VITE_WORKNET_AUTH_KEY,
        startPage = 1,
        display = 20,
        empCoNo,
        coClcd,
        empWantedTypeCd,
        empWantedCareerCd,
        jobsCd,
        empWantedTitle,
        empWantedEduCd,
        sortField,
        sortOrderBy,
        busino,
        ...otherParams
    } = options
    
    if (!authKey) {
        throw new Error('인증키(authKey)가 필요합니다. 환경변수 VITE_WORKNET_AUTH_KEY를 설정하거나 options에 authKey를 제공하세요.')
    }
    
    // 공채기업정보 API URL 파라미터 구성
    const params = new URLSearchParams({
        authKey,
        callTp: 'L',
        returnType: 'XML',
        startPage: startPage.toString(),
        display: Math.min(display, 100).toString(), // 최대 100건
    })
    
    // 선택적 파라미터 추가
    if (empCoNo) params.append('empCoNo', empCoNo)
    if (coClcd) params.append('coClcd', coClcd)
    if (empWantedTypeCd) params.append('empWantedTypeCd', empWantedTypeCd)
    if (empWantedCareerCd) params.append('empWantedCareerCd', empWantedCareerCd)
    if (jobsCd) params.append('jobsCd', jobsCd)
    if (empWantedTitle) params.append('empWantedTitle', encodeURIComponent(empWantedTitle))
    if (empWantedEduCd) params.append('empWantedEduCd', empWantedEduCd)
    if (sortField) params.append('sortField', sortField)
    if (sortOrderBy) params.append('sortOrderBy', sortOrderBy)
    if (busino) params.append('busino', busino)
    
    // 기타 파라미터 추가
    Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
        }
    })
    
    try {
        const fullUrl = `${WORKNET_PUBLIC_COMPANY_API_URL}?${params.toString()}`
        console.log('워크넷 공채기업정보 API 호출:', fullUrl)
        
        const response = await fetch(fullUrl)
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            console.error('API 응답 오류:', response.status, response.statusText, errorText.substring(0, 200))
            throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`)
        }
        
        const xmlString = await response.text()
        
        // XML 응답 확인 (디버깅용)
        console.log('워크넷 공채기업정보 API 응답:', xmlString.substring(0, 1000))
        
        // 빈 응답 체크
        if (!xmlString || xmlString.trim().length === 0) {
            throw new Error('API 응답이 비어있습니다.')
        }
        
        const jobPostings = parsePublicCompanyXML(xmlString)
        
        if (jobPostings.length === 0) {
            console.warn('워크넷 공채기업정보 API에서 채용정보를 가져오지 못했습니다. XML 구조를 확인하세요.')
            console.log('전체 XML 응답:', xmlString)
        } else {
            console.log(`✅ 공채기업정보 ${jobPostings.length}건을 가져왔습니다.`)
        }
        
        return jobPostings
    } catch (error) {
        console.error('워크넷 공채기업정보 API 호출 오류:', error)
        throw error
    }
}

/**
 * 고용형태 코드를 한글 텍스트로 변환
 * @param {string} empTpCd - 고용형태 코드
 * @returns {string} 고용형태 텍스트
 */
export function getEmploymentTypeText(empTpCd) {
    const typeMap = {
        '10': '정규직',
        '11': '정규직(시간선택제)',
        '20': '계약직',
        '21': '계약직(시간선택제)',
        '4': '파견근로',
    }
    
    return typeMap[empTpCd] || '정규직'
}

