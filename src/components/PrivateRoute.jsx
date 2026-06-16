
// 로그인이 필요한 페이지를 보호하는 컴퍼넌트
// isLoggedIn(Zustand) 또는 localStorage "tokens" 존재 여부를 확인
// 둘 중 하나라도 true 이면 페이지를 보여준다.

// 사용법 : App.js 에서 원하는 Route 에 넣어준다.
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";


// children => React의 특별한 props, 컴포넌트 태그 사이에 넣은 내용이 자동으로 전
export default function PrivateRoute({children}) {

    // Zustand 로그인 상태
   const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
   // !! 는 값을 boolean으로 강제 변환하는 관용 표현 
   const hasTokens = !!localStorage.getItem('tokens')

   return (isLoggedIn || hasTokens) ? children : <Navigate to="/login" replace /> 
}