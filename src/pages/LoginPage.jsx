import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { getKakaoLoginUrl, getNaverLoginUrl, login } from "../api/Auth";

export default function LoginPage() {
   const navigate = useNavigate()
   
    // Zustand 에서 로그인 상태 구독
    const isLoggedIn = useAuthStore((state)=>state.isLoggedIn) 
    const user = useAuthStore((state)=>state.user) 
    const zu_login = useAuthStore((state)=>state.zu_login)
    const zu_logout = useAuthStore((state)=>state.zu_logout)

    const [formData, setFormData] =useState({m_id: '', m_pw: ''})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    // 만약 로그인이 된 상태 이면 화면 
    if(isLoggedIn){
      return(
        <div className="page" style={{maxWidth: '400px'}}>
          <h2 style={{marginBottom: '16px'}}>로그인 된 상태</h2>
          <div className="card" style={{padding:'20px', marginBottom:'16px'}}>
              <p style={{fontWeight:'bold', marginBottom:'4px'}}>
                {user?.m_name || user?.m_id}
              </p>
              <p className="muted" style={{fontSize:'13px'}}>{user?.m_email || ''} </p>
          </div>
          <div className="row" style={{gap:'10px'}}>
            <button className="ghost" onClick={()=>navigate('/profile')}>마이페이지</button>
            <button className="danger" onClick={zu_logout}>로그아웃</button>
          </div>
        </div>
      )
    }
    const handleChange = (e)=>{
      setFormData((prev)=>({...prev, [e.target.name]:e.target.value}))
    }

    const handleSubmit = async (e)=>{
      // form submit 시  페이지 이동을 막는 용도로 사용
      // 폼 제출(Submit) 방지: form 내 버튼 클릭 시 페이지가 새로고침되는 것을 막고, 
      // JavaScript로 데이터를 검증하거나 비동기(AJAX) 처리를 할 때 필수입니다.
      // 링크 이동(Anchor) 방지: <a> 태그 클릭 시 설정된 URL로 이동하지 않게 하여, 
      // 싱글 페이지 애플리케이션(SPA)에서 내부 경로만 변경할 때 사용합니다.
        e.preventDefault()
        setError('')
        setLoading(true)
      try {
        // Auth.jsx login 함수 호출
         const response = await login(formData.m_id, formData.m_pw)
         const {success, message, data} = response.data
         if(success){
            const {accessToken, refreshToken, membersVO} = data
            // 로그인 성공 시  tokens 저장
            localStorage.setItem('tokens', JSON.stringify({
              accessToken,
              refreshToken,
              // 나중에는 전체 정보가 아니라 간단한 정보만 남겨 두자 
              user: membersVO 
            }))
            zu_login(membersVO)
            navigate("/")
         }else{
          setError(message || '아이디 또는 비밀번호를 확인해 주세요')
         }
      } catch (error) {
        setError('서버 연결에 실패 했습니다.')
      } finally{
        setLoading(false)    
      }
    }
    return(
    <div className="page" style={{ maxWidth: '360px' }}>
      <h2 style={{ marginBottom: '24px' }}>로그인</h2>
      <form onSubmit={handleSubmit} className="col">
         <div className="muted" style={{gap:'6px'}}>
            <label className="muted" style={{fontSize:'13px'}}>아이디</label>
            <input name="m_id" value={formData.m_id} onChange={handleChange} placeholder="아이디 입력" required />
          </div> 

          <div className="muted" style={{gap:'6px'}}>
            <label className="muted" style={{fontSize:'13px'}}>비밀번호</label>
            <input name="m_pw" value={formData.m_pw} onChange={handleChange} placeholder="비밀번호 입력" required />
          </div> 
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading} style={{marginTop:'8px'}}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <p className="muted" style={{textAlign:'center', fontSize:'13px', marginTop:'4px'}}>
            계정이 없으신가요? <Link to="/register">회원가입</Link></p>
          {/* 소셜 로그인 구분선 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0 16px',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#444' }} />
            <span className="muted" style={{ fontSize: '12px' }}>또는</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#444' }} />
          </div>

          {/* 네이버 로그인 버튼 */}
          <button
            type="button"
            onClick={() => window.location.href = getNaverLoginUrl()}
            style={{
              backgroundColor: '#03C75A',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '10px'
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>N</span>
            네이버로 로그인
          </button>

          {/* 카카오 로그인 버튼 */}
          <button
            type="button"
            onClick={() => window.location.href = getKakaoLoginUrl()}
            style={{
              backgroundColor: '#FEE500',
              color: '#000',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>K</span>
            카카오로 로그인
          </button>
          
        </form> 
    </div>
    );
}