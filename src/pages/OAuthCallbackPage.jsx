import { useNavigate, useSearchParams } from "react-router-dom"
import useAuthStore from "../store/useAuthStore";
import { useEffect, useState } from "react";
import { kakaoOAuthCallback, naverOAuthCallback } from "../api/Auth";

export default function OAuthCallbackPage(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const zu_login = useAuthStore((state)=>state.zu_login)

    const [status, setStatus] = useState('processing')
    const [error, setError] = useState("")
    useEffect(()=>{
        const processOAuthCallback = async () =>{
            try {
                // Auth.jsx에서 인가 코드를 받아서 
                const code = searchParams.get("code")
                const state = searchParams.get("state")
                const provider = sessionStorage.getItem("oauth_provider")


                if(!code){
                    setStatus("error")
                    setError("인가 코드가 없습니다.")
                    return;
                }

                let response ;
                
                if(provider === "naver"){
                    // 네이버는 state 검증
                    const savedState = sessionStorage.getItem("oauth_state")
                    if(state !== savedState){
                        setStatus("error")
                        setError("보안 검증 실패 했습니다.")
                        return;
                    }
                    response = await naverOAuthCallback(code, state)
                }else if(provider === "kakao"){
                    response = await kakaoOAuthCallback(code)
                }else{
                    setStatus("error")
                    setError("제공가를 알수 없습니다.")
                    return;
                }

                const {success, message, data } = response.data ;
                if(success){
                    const {accessToken, refreshToken, membersVO} = data

                    // 토큰 저장
                    localStorage.setItem("tokens", JSON.stringify({
                        accessToken,
                        refreshToken,
                        user: membersVO
                    }));
                    zu_login(membersVO)
                    sessionStorage.removeItem("oauth_state")
                    sessionStorage.removeItem("oauth_provider")

                    setStatus("success")

                    // 홈으로 이동
                    // 현재 히스토리를 대체 (뒤로가기 불가)
                    // replace: false를 하면 OAuth콜백 페이지로 돌아감
                    setTimeout(()=>{
                        navigate("/", {replace: true})
                    },1000)
                }else{
                    setStatus("error");
                    setError( message ||  "로그인에 실패");  
                }
            } catch (err) {
                setStatus("error");
                setError("서버에 연결 실패");
            }
        }
        
        processOAuthCallback();
    },[searchParams, navigate, zu_login])
       
    return(
        <div className="page" style={{ maxWidth: "400px", textAlign: "center" }}>
            {status === "processing" && (
                <>
                    <h2 style={{ marginBottom: "16px" }}>로그인 처리 중...</h2>
                    <div className="card" style={{ padding: "40px" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid #333",
                            borderTop: "4px solid #03C75A",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 16px"
                        }} />
                        <p className="muted">잠시만 기다려 주세요</p>
                    </div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </>
            )}

            {status === "success" && (
                <>
                    <h2 style={{ marginBottom: "16px", color: "#03C75A" }}>로그인 성공!</h2>
                    <div className="card" style={{ padding: "40px" }}>
                        <p>홈으로 이동합니다...</p>
                    </div>
                </>
            )}

            {status === "error" && (
                <>
                    <h2 style={{ marginBottom: "16px", color: "#ff4444" }}>로그인 실패</h2>
                    <div className="card" style={{ padding: "40px" }}>
                        <p style={{ color: "#ff4444", marginBottom: "16px" }}>{error}</p>
                        <button onClick={() => navigate("/login")}>
                            로그인 페이지로 돌아가기
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}