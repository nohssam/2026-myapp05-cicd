//  Spring Boot 서버로 보내는 API 함수 모음 + JWT 인터셉터 
//  구조  : API 함수들  : 각 엔드 포인트들 함수,  
//         요청 인터셉터 : jwt 토큰을 헤더에 자동으로 추가 
//         응답 인터셉터 : 토큰 만료 시 자동으로 토큰 재발급 후 재시도

import useAuthStore from "../store/useAuthStore";
import { api } from "./Http";



// OAuth 설정
export const OAUTH_CONFIG = {
    naver: {
       clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
       redirectUri : process.env.REACT_APP_NAVER_REDIRECT_URI,
       authUrl: 'https://nid.naver.com/oauth2.0/authorize'
    },
    kakao: {
       clientId: process.env.REACT_APP_KAKAO_CLIENT_ID,
       redirectUri : process.env.REACT_APP_KAKAO_REDIRECT_URI,
       authUrl: 'https://kauth.kakao.com/oauth/authorize'
    }
}


// 네이버 로그인 URL 생성
export const getNaverLoginUrl = () => {
    const {clientId, redirectUri, authUrl} = OAUTH_CONFIG.naver ;
    const state = generateRandomState();
    // state를 sessionStorage 에 저장 (CSRF 방지용)
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('oauth_provider', 'naver')

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state
    });
    return `${authUrl}?${params.toString()}`;
}


// 카카오 로그인 URL 생성
export const getKakaoLoginUrl = () => {
    const {clientId, redirectUri, authUrl} = OAUTH_CONFIG.kakao ;
    const state = generateRandomState();
    sessionStorage.setItem('oauth_provider', 'kakao')

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri
    });
    return `${authUrl}?${params.toString()}`;
}

const generateRandomState = () => {
    return Math.random().toString(36).substring(2,15) +
           Math.random().toString(36).substring(2,15) 
}

// 네이버 OAuth 콜백 API 호출
export const naverOAuthCallback = (code, state) =>
    api.post('/members/oauth/naver', { code, state })

// 카카오 OAuth 콜백 API 호출
export const kakaoOAuthCallback = (code) =>
    api.post('/members/oauth/kakao', { code })


// 토큰 저장 위치 : localStorage "tokens" 키에 JSON 으로 저장
//               {accessToken, refreshToken, user}

export const register = (member) =>
    api.post('/members/register', member)

export const login = (m_id,m_pw) =>
    api.post('/members/login',{m_id, m_pw})

export const logout = () => 
    api.post('/members/logout')

export const myPage = () =>
    api.get('/members/myPage')

export const deleteMember = () =>
    api.get('/members/delAccount')

export const updateMember = (member) =>
    api.post('/members/updateMember', member)

// 아이디 중복 확인
// 응답 : {success:true}=>사용가능 , {success:false}=>중복
export const checkId = (m_id) =>
    api.get(`/members/checkId?m_id=${m_id}`)

// 요청 인터셉터 
api.interceptors.request.use(
    (config) => {
        // 토큰을 붙이지 않아도 되는 경로 
        const exludePaths = [
            '/members/login',
            '/members/register',
            '/members/refresh'
        ]

        // 위에서 지정한 엔드포인트를 제외하고 
        const isExcluded = exludePaths.some((path)=> config.url.includes(path))

        if(!isExcluded){
            // localStorage에서 토큰 가져오기
            const tokens = localStorage.getItem('tokens')
            if(tokens){
                const parsed = JSON.parse(tokens)
                if(parsed?.accessToken){
                    // request 헤더 부분에 토큰 넣기 
                    config.headers.Authorization = `Bearer ${parsed.accessToken}`
                }
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)


// 동시에 여러 요청이 401 받아도 refresh는 1번만 수행하기 위한 잠금 코드
let isRefreshing = false
let refreshSubscribers = [] // refresh 완료를 기다리는 요청들

// refresh 완료 후 대기중인 요청들에게 새 토큰 전달
const onRefreshed = (newAccessToken) => {
    refreshSubscribers.forEach(k=>k(newAccessToken))
    refreshSubscribers=[]
}

// 응답 인터셉터
// 정상응답일때 그대로 반환 
// AccessToken 만료 되면  -> accessToken 재발급 시도
api.interceptors.response.use(
    (res) => res, // 정상응답일때 그대로 반환 

    async(error) => {
        const {config, response} = error
        // config 없으면 (네트워크 단절) 즉시 reject
        if(!config) return Promise.reject(error)

        // refresh, logout 요청에서 난 에러는 재시도 하지 않음
        // 재시도 하면 무한 루프 발생 
        const excludePaths = ['/members/refresh', '/members/logout']
        const isExcluded = excludePaths.some((path)=> config.url.includes(path))
        if(isExcluded) return Promise.reject(error)
        
        // 재시도 하지 않는 경우 (나중에)
        // config._retry 는 재시도 방지
        if(response?.status === 401 && !config._retry){
            console.log("response : ",  response)
            config._retry = true

            // 이미 refresh 진행 중이면 완료될 때까지 대기 후 재시도 
            if(isRefreshing){
                // 성공적으로 완료됐다는 의미
              return new Promise((resolve)=>{
                    refreshSubscribers.push((newAccessToken) => {
                        config.headers.Authorization = `Bearer ${newAccessToken}`
                        resolve(api(config))
                    })
              })
            }
            
            isRefreshing = true

            try {
                // localStorege 에서 refreshToken 꺼내기
                const stored = localStorage.getItem("tokens")
                const parsed = stored ? JSON.parse(stored) : {}

                // POST /members/refresh 로 새 accessToken 요청
                const res = await api.post("/members/refresh",{
                    refreshToken: parsed.refreshToken
                })
                
                const {data} = res.data

                if(!data || !data.accessToken){
                    throw new Error('AccessToken 발급 실패')
                }

                // 새 토큰 저장
                const newTokens = {
                    ...parsed,
                    accessToken:  data.accessToken,
                    refreshToken: data.refreshToken
                }
                localStorage.setItem('tokens', JSON.stringify(newTokens))

                // zustand 로그인 상태 유지 
                useAuthStore.getState().zu_login(parsed.user)

                // 추가)대기중이던 요청들에게 새 토큰 전달
                isRefreshing = false
                onRefreshed(data.accessToken)

                // 추가)현재 요청 재시도
                config.headers.Authorization = `Bearer ${data.accessToken}`
                return api(config)

            } catch (error) {
                isRefreshing = false
                refreshSubscribers = []
                // refreshToken 도 만료 - 완전 로그아웃
                useAuthStore.getState().zu_logout()
                window.location.href = "/login"
            }
        }

        return Promise.reject(error)

    }

)