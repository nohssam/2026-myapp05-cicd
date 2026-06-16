import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { checkId, register } from "../api/Auth"

export default function RegisterPage(params) {
    // 회원가입 성공시 로그인으로 이동 
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        m_id: '',
        m_pw: '',
        m_name: '',
        m_addr: '',
        m_email: '',
        m_phone: ''
    })

    // 추가 내용
    // 비밀번호 확인 입력값
    const [pwConfirm, setPwConfirm] = useState('')

    // 중복결과 확인 : '' | 'available' | 'taken'
    const [idStatus, setIdStatus] = useState('')
    
    // 중보결과 통과 여부 (제출 전 검사용)
    const [idChecked, setIdChecked] = useState(false)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // 세 조건이 모두 충조돼야 회원 가입 버튼 활성화 
    // 1) 아이디 중복 확인 통과 2) 비밀번호 입력 됨 3) 비밀번호 확인 일치
    const canSubmit = idChecked && formData.m_pw.length > 0 && formData.m_pw === pwConfirm

    // prev 이전 정보
    const handleChange = (e) =>{
        // 추가
        const {name, value} = e.target
        // 아이디 입력값이 바뀌면 중복 확인 상태 초기화 (재 확인 강제)
        if(name === 'm_id'){
            setIdStatus('')
            setIdChecked(false)
        }

        setFormData((prev)=>({...prev, [name]: value}))
    }

    // 아이디 중복확인 버튼 클릭 핸들러 
    const handleIdCheck = async() =>{
       if(!formData.m_id.trim()){
        setIdStatus('empty')
        return
       }

       try {
            const response = await checkId(formData.m_id)
            const {success} = response.data
            if(success){
                setIdStatus('available') // 사용가능
                setIdChecked(true)
            }else{
                setIdStatus('taken') // 이미 사용
                setIdChecked(false) 
            }
       } catch (error) {
            setIdStatus('error')     // 서버 오류
            setIdChecked(false) 
       }
    }


    // 회원 가입 서버로 정보를 보내기 
    //  e.preventDefefault() : 브라우저의 기본 동작을 중단시키기 위해 명시적으로 호출해야 하는 메서드
    // <form> 제출 시: 폼을 제출할 때 페이지가 새로고침되는 것을 막고, JavaScript로 데이터를 처리할 때 사용합니다.
    const handleSubmit = async (e) =>{
        e.preventDefault()
        setError('')
         
        // 중복확인 하지 않으면 제출 차단
        if(!idChecked){
            setError('아이디 중복을 확인 해주세요')
            return
        }

        // 비밀번호가 일치 여부 확인
        if(formData.m_pw !== pwConfirm){
            setError('비밀번호가 일치하지 않습니다.')
            return 
        }

        setLoading(true)
        try{
            // spring에서 결과 정보를 받자 
            // register는  Auth.jsx의 register 함수 호출
           const response = await register(formData)
         
           const {success, message} = response.data
           if(success){
             navigate('/login')
           }else{
             setError(message || '회원가입실패')
           }

        }catch(err){
           setError('서버 연결에 실패했습니다.') 
        }finally{
          setLoading(false)
        }
    }

    return(
        <div className="page" style={{maxWidth: '400px'}}>
            <h2 style={{marginBottom: '28px'}}>회원가입</h2>
            <form onSubmit={handleSubmit} className="col">
                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 아이디</label>
                    <div className="row" style={{gap: '8px'}}>
                        <input name="m_id" value={formData.m_id} 
                           onChange={handleChange} placeholder="아이디를 입력하세요" required style={{flex: 1}}/>
                        <button type="button" className="ghost" onClick={handleIdCheck}>중복확인</button> 
                    </div>
                     {/* 중복 결과 메시지 */}
                    {idStatus === 'available' && <p style={{color: '#4caf50'}}>사용 가능한 아이디 입니다</p>}
                    {idStatus === 'taken' && <p style={{color: '#f44336'}}>이미 사용중인 아이디 입니다</p>}
                    {idStatus === 'empty' && <p style={{color: '#f44336'}}>아이디를 입력해 주세요</p>}
                    {idStatus === 'error' && <p style={{color: '#f44336'}}>서버 오류가 발생 했습니다</p>}
                </div>
               
                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 비밀번호</label>
                    <input type="password" name="m_pw" value={formData.m_pw} 
                           onChange={handleChange} placeholder="비밀번호를 입력하세요" required />
                </div>
                {/* 비밀번호 확인 */}
                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 비밀번호 확인</label>
                    <input type="password" value={pwConfirm} 
                           onChange={(e)=> setPwConfirm(e.target.value)} placeholder="비밀번호를 다시 입력하세요" required />
                    {/*  입력 중 실시간 일치 여부 표시 */}
                    {pwConfirm && formData.m_pw !== pwConfirm && (
                        <p style={{color: '#f44336'}}>비밀번호가 일치 하지 않습니다</p>
                    )}
                    {pwConfirm && formData.m_pw === pwConfirm && (
                        <p style={{color: '#4caf50'}}>비밀번호가 일치 합니다</p>
                    )}
                </div>

                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 이름</label>
                    <input name="m_name" value={formData.m_name} 
                           onChange={handleChange} placeholder="이름를 입력하세요" required />
                </div>
                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 주소</label>
                    <input name="m_addr" value={formData.m_addr} 
                           onChange={handleChange} placeholder="주소를 입력하세요" required />
                </div>
                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 이메일</label>
                    <input name="m_email" value={formData.m_email} 
                           onChange={handleChange} placeholder="이메일를 입력하세요" required />
                </div>
                <div className="col" style={{gap: '6px'}}>
                    <label className="muted" style={{fontSize:'13px'}}><sup style={{fontSize: '6px'}}>** </sup> 전화번호</label>
                    <input name="m_phone" value={formData.m_phone} 
                           onChange={handleChange} placeholder="전화번호를 입력하세요" required />
                </div>
                
                {error && <p className="error-text">{error}</p>}

                <button type="submit" disabled={!canSubmit || loading}>
                    {loading ? '처리 중...' : '회원가입' }
                </button>
                <p className="muted" style={{textAlign:'center',fontSize:'13px', marginTop:'4px'}}>
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </p>
            </form>
        </div>
    )
}