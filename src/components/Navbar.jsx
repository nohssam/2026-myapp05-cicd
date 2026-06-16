import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { logout } from "../api/Auth";

export default function Navbar() {
    const navigate = useNavigate()
     // Zustand 에서 로그인 상태 구독
    const isLoggedIn = useAuthStore((state)=>state.isLoggedIn) 
    const zu_logout = useAuthStore((state)=>state.zu_logout) 

    // 로그인 여부 처리 
    // NavLink가 자동으로 제공하는 값 ()
    // 현재 경로이면 true, 아니면 false
    // 현재 URL이 to 경로와 일치하면 true
    const cls = ({isActive}) => isActive ? 'active' : ''
    const handleLogout = async () =>{
        try {
            // 서버에 로그아웃 요청 (Auth.jsx)
            await logout()
        } catch (error) {
           console.log(error) 
        } finally{
           zu_logout()
           navigate("/") 
        }
    }
    return(
        <nav>
            <span className="nav-logo">Zustand</span>
            <NavLink to="/" className={cls}>홈</NavLink>
            <NavLink to="/todo" className={cls}>Todo</NavLink>
            <NavLink to="/memo" className={cls}>Memo</NavLink>
            <NavLink to="/guestbook" className={cls}>방명록</NavLink>
            {/* 로그인이 되었을 때만 보이게 하자  */}
            {isLoggedIn && <NavLink to="/profile" className={cls}>프로필</NavLink>}

            {/* 로그인 성공하면 안보이게 */}
            {!isLoggedIn && <NavLink to="/login" className={cls}>로그인</NavLink>}
            {!isLoggedIn && <NavLink to="/register" className={cls}>회원가입</NavLink>}

            {/* 로그인 된 상태일때 로그아웃도 보여야 한다. */}
            {/*  onClick={logout} 에서 logout은 useAuthStore에 있는 함수이다.*/}
            <div className="ml-auto">
                {isLoggedIn && (
                    <button className="danger" onClick={handleLogout} style={{padding: '6px 12px'}}>
                        로그아웃</button>
                )}
            </div>
        </nav>
    );
}
