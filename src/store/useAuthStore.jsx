// Zustand의 create 함수와 persist 미들웨어를 가져온다
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 미들웨어 사용하지 않는이유 : Auth.jsx에서 localStorage에 직접 사용
const useAuthStore = create(
    (set) => ({
            // ── 상태(State) : 변수 ─────────────────────────────────
            user: null, // 로그인한 사용자 { username, bio }. 미로그인 시 null
            isLoggedIn: false, // 로그인 여부 플래그

            // localStorage 에서 읽어온 회원 정보 
            zu_login: (user) => set({isLoggedIn:true, user}),

            zu_logout: ()=>{
                localStorage.removeItem('tokens')
                set({isLoggedIn:false, user:null})
            }

    }))

export default useAuthStore
