// axios 인스턴스 생성
// axios 인스턴스를 만들어서 export 하는 것만 담당한다.
// Axios는 브라우저와 Node.js를 위한 Promise 기반의 HTTP 비동기 통신 라이브러리입니다.
// 서버와 프론트엔드 간의 데이터를 주고받는 작업을 편리하게 만들어주며, 웹 개발에서 백엔드와 소통하는 데 널리 사용됩니다. 
// 비동기 통신(async, await), 자동 JSON 변환, 

import axios from 'axios'

// 서버와 통신하는 axios 인스턴스
// npm start (개발)    => .env.development 파일을 읽어
// npm run build(배포) => .env.production 파일을 읽어 
export const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // CORS 환경에서 인증 허용
})