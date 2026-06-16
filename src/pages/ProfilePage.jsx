import { useState, useEffect} from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {deleteMember, myPage, updateMember} from "../api/Auth"

export default function ProfilePage() {
    const navigate = useNavigate();
    const zu_logout = useAuthStore((state) => state.zu_logout)
    
    const [member, setMember] = useState(null)   // 회원정보
    const [loading, setLoading] = useState(true) // 로딩 중  여부
    const [error, setError] = useState('')       // 에러 메시지

    // 수정
    const [form, setForm] = useState({m_name:'', m_email:'', m_phone:'', m_addr:'', m_addr2:''})
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    // useEffect 내부에서만 사용
    // 마운트 시 딱 한번만 실행
    useEffect(()=>{
        const fetchMyPage = async () => {
            try {
                const response = await myPage()
                const {success, message, data} = response.data             
                if(success){
                   setMember(data)  // 회원정보 저장
                   setForm({                      
                      m_name: data.m_name || '',
                      m_email: data.m_email || '',
                      m_phone: data.m_phone || '',
                      m_addr: data.m_addr || '',
                      m_addr2: data.m_addr2 || '',    
                   })
                }else{
                   setError(message || '정보 호출 실패') 
                }

            } catch (error) {
                console.log(error)
                setError('서버 연결 실패')
            } finally{
                setLoading(false)
            }
        }

        fetchMyPage()
    },[])
    
    if(loading){
        return <div className="page"><p className="muted">불러오는 중...</p></div>
    }
    
    if(error){
        return <div className="page"><p className="error-text">{error}</p></div>
    }

    const handleDelete = async () => {
        if(!window.confirm("정말 탈퇴 할까요?")) return
        try {
          await deleteMember()
          zu_logout()
          navigate('/')   
        } catch (error) {
           alert("탈퇴 실패") ;
        }
    }
    
    // 수정하기 
    const handleUpdate = async () =>{
        setSaving(true)
        try{
          const response = await updateMember(form)
          const {success, message} = response.data
          if(success){
            setMember((prev) => ({...prev, ...form}))
            setIsEditing(false)
          }else{
            alert(message || "회원 정보 수정 실패")
          }
        }catch(error){
            alert("회원 정보 수정 실패")
        }finally{
            setSaving(false)
        }

    }

    const handleChange = (e) =>
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}))
    
    return(
        <div className="page" style={{maxWidth: '400px'}}>
            <h2 style={{marginBottom: '28px'}}>My Page</h2>
            <div className="card col" style={{padding: '18px', gap: '12px'}}>
                <div>
                    <p className="muted" style={{fontSize: '10px', marginBottom: '4px'}}>이름</p>
                  {isEditing
                    ? <input name="m_name" value={form.m_name} onChange={handleChange}  />
                    : <p style={{fontWeight: 'bold'}}>{member?.m_name || '-'} </p>
                  }
                </div>
                <div>
                    {/* 아이디는 수정 불가 */}
                    <p className="muted" style={{fontSize: '10px', marginBottom: '4px'}}>아이디</p>
                    <p style={{fontWeight: 'bold'}}>{member?.m_id || '-'} </p>
                </div>
                <div>
                    <p className="muted" style={{fontSize: '10px', marginBottom: '4px'}}>이메일</p>
                     {isEditing
                    ? <input name="m_email" value={form.m_email} onChange={handleChange}  />
                    : <p style={{fontWeight: 'bold'}}>{member?.m_email || '-'} </p>
                  }
                </div>
                <div>
                    <p className="muted" style={{fontSize: '10px', marginBottom: '4px'}}>전화번호</p>
                     {isEditing
                    ? <input name="m_phone" value={form.m_phone} onChange={handleChange}  />
                    : <p style={{fontWeight: 'bold'}}>{member?.m_phone || '-'} </p>
                     }
                </div>
                 <div>
                    <p className="muted" style={{fontSize: '10px', marginBottom: '4px'}}>주소</p>
                     {isEditing
                    ? <input name="m_addr" value={form.m_addr} onChange={handleChange}  />
                    : <p style={{fontWeight: 'bold'}}>{member?.m_addr || '-'} </p>
                     }
                </div>
                {/* 주소2는 없을 수도 있다. */}
                {(isEditing || member?.m_addr2) && (
                    <div>
                        <p className="muted" style={{fontSize: '10px', marginBottom: '4px'}}>주소2</p>
                        {isEditing
                            ? <input name="m_addr2" value={form.m_addr2} onChange={handleChange}  />
                            : <p style={{fontWeight: 'bold'}}>{member?.m_addr2} </p>
                         }
                    </div>
                )}
            <div className='row' style={{marginTop: '15px'}} >
                { isEditing ? (
                  <>
                     <button onClick={handleUpdate} disabled={saving}>
                        {saving ? '저장중...' : '저장'}
                     </button>
                     <button onClick={()=>setIsEditing(false)}>취소</button>
                  </>      
                ):(
                  <button onClick={()=>setIsEditing(true)}>수정</button>  
                )}
                { !isEditing && <button className='danger' onClick={handleDelete}>회원탈퇴</button>}
             </div>
            </div>
        </div>
    );
}