import { useEffect, useState } from "react"
import useGuestbookStore from "../store/useGuestbookStore"
import { guestbookDelete, guestbookInsert, guestbookList, guestbookUpdate } from "../api/GuestBook"
import useAuthStore from "../store/useAuthStore"

export default function GuestBookPage(params) {
    const {guestbooks, setGuestbooks, removeGuestbook, updateGuestbook} = useGuestbookStore()
    const isLoggedIn = useAuthStore((state)=>state.isLoggedIn)
    // 이름과 email을 유저 정보에서 가져오자 
    const user = useAuthStore((state)=> state.user)

    // 수정 중인 글의 번호를 저장하는 
    // null 아무것도 수정 중이 아니다.
    const [editId, setEditId] = useState(null);
    const [editSubject, setEditSubject] = useState('')
    const [editContent, setEditContent] = useState('')
    const [editPwd, setEditPwd] = useState('')
    const [editError, setEditError] = useState('')

    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [pwd, setPwd] = useState('')

    // 등록, 수정
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 삭제
    const [deleteId, setDeleteId] = useState(null)
    const [deletePwd, setDeletePwd] = useState('')
    const [deleteError,setDeleteError] = useState('')
    


    // 다른 곳에서 호출 가능
    // 새로 고침/추가/수정 후 재호출 필요
    const fetchList = async ()=> {
        try {
            const res = await guestbookList()
            if(res.data.success && res.data.data){
                setGuestbooks(res.data.data)
            }else{
                setGuestbooks([])
            }
        } catch (error) {
           console.log(error)
        }
    }
    useEffect(()=>{
      fetchList()
    },[])

    const handleAdd = async () =>{
        setLoading(true)
        setError('')
        try{
            // 로그인정보 중 name, email은 가져오자 
            await guestbookInsert({
                g_writer : user.m_name,
                g_subject : subject,
                g_content : content,
                g_email : user.m_email,
                g_pwd : pwd
            })
            setSubject('')
            setContent('')
            setPwd('')

            // 리스트보기
            fetchList()
        }catch(e){
            setError('등록 실패')
        }finally{
            setLoading(false)
        }
    }

    const handleEditStart = (g) =>{
        setEditId(g.g_idx)
        setEditSubject(g.g_subject)
        setEditContent(g.g_content)
        setEditError('')
    }

    const handleEditSave = async () =>{
        if(!editPwd.trim()) {
            setEditError('비밀번호 넣어주세요')
            return
        }

        try{
            const res =  await guestbookUpdate({
                g_idx: editId,
                g_subject: editSubject,
                g_content: editContent,
                g_writer: user.m_name,
                g_pwd: editPwd
            })
            if(!res.data.success){
                setEditError(res.data.message)
                return
            }
            updateGuestbook(editId, {g_subject:editSubject, g_content:editContent})
            setEditId(null)
            setEditPwd('')
            return
        }catch(error){
           setEditError('수정에 실패했습니다.')
        }
    }

    const handleDeleteConfirm = async (g_idx) =>{
        if(!deletePwd.trim())  {
           setDeleteError("비밀번호 입력하세요")
           return
        }

        try{
            const res = await guestbookDelete(g_idx, deletePwd)
            if(!res.data.success){
               setDeleteError(res.data.message)
               setDeletePwd('')
               return
            }
            removeGuestbook(g_idx)
            setDeleteId(null)
            setDeletePwd('')

        }catch(e){
            setDeleteError('삭제에 실패 했습니다.')
        }
    }

    
    return (
       <div className="page" style={{maxWidth: '400px'}}>
            <h2 style={{marginBottom: '24px'}}>방명록</h2>
           { isLoggedIn ? (
                // 로그인 했기 때문에 이름과 이메일은 안받는다.
                // (로그인 정보를 무시하려면 다 받아서 처리 할 수도 있다.)    
                <div className="card col" style={{padding:'20px', gap:'10px', marginBottom:'28px'}}>
                    <input
                        value={subject}
                        onChange={(e)=> setSubject(e.target.value)}
                        placeholder="제목 입력"
                        required
                     />
                     <textarea
                        value={content}
                        onChange={(e)=>setContent(e.target.value)}
                        placeholder="내용 입력"
                        rows={4}
                        required
                     />
                     <input
                        type="password"
                        value={pwd}
                        onChange={(e)=> setPwd(e.target.value)}
                        placeholder="비밀번호"
                        required
                     />
                     <button 
                        onClick={handleAdd}
                        disabled={loading}
                        >{loading ? '...' : '등록'}</button>
                </div>
              ) : (
              <>
                <p className="muted" style={{marginBottom:'24px'}}>
                    로그인 하면 글을 작성할 수 있습니다.
                </p>
              </>      
              )
            }
            <div className="col">
                  {guestbooks.length === 0 && <p className="empty">방명록이 비었습니다.</p>}  
                  {guestbooks.map((g) => (
                    <div key={g.g_idx} className="card" style={{padding: '16px 20px', borderRadius:'10px'}}>

                            {/* 단순 리스트 */}
                            {/* 
                            <p>{g.g_subject}</p>
                            <p>{g.g_content}</p>
                            <p>{g.g_writer} </p>
                            <p>{g.g_regdate}</p>  
                            */}
                        
                        {editId === g.g_idx ? (
                            <div>
                                <div className="col" style={{gap:'8px'}}>
                                    <input
                                        value={editSubject}
                                        onChange={(e)=> setEditSubject(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e)=>setEditContent(e.target.value)}
                                        rows={4}
                                        required
                                    />
                                    <input
                                       type="password"
                                        value={editPwd}
                                        onChange={(e)=> setEditPwd(e.target.value)}
                                        required
                                    />
                                </div>    
                                <div className="row" style={{marginTop:'8px'}}>
                                    <button onClick={handleEditSave}>저장</button>
                                    <button className="ghost" onClick={() => {setEditId(null); setEditPwd(''); setEditError('')}}>취소</button>
                                </div>    
                                <div style={{color:'red', marginTop:"8px"}}>{editError}</div>
                            </div>
                        ):(
                          <>
                            <p style={{fontWeight:'bold', marginBottom:'4px'}}>{g.g_subject}</p>
                            {/* <p className="muted" style={{fontSize:'12px', marginBottom:'8px'}}><pre>{g.g_content}</pre></p> */}
                            <textarea disabled rows={4} className="muted" style={{fontSize:'12px', marginBottom:'8px'}}>{g.g_content}</textarea>
                            <p style={{color:'#334155', fontSize:'10px', marginBottom:'8px'}}>{g.g_writer} ● {g.g_regdate} </p>
                            
                            {/* 버튼이 보이는 조건 : 로그인 상태, 입력한 사람의 이름이 같을 때  */}
                            {isLoggedIn && user?.m_name === g.g_writer &&( 
                                <div className="col">
                                    <button  onClick={()=> handleEditStart(g)}>수정</button>
                                    {deleteId === g.g_idx ? (
                                        <>
                                            <button className="danger" onClick={()=>handleDeleteConfirm(g.g_idx)}>삭제요청</button>
                                            <input type="password"
                                                  value={deletePwd}
                                                  onChange={(e)=>setDeletePwd(e.target.value)}
                                                  placeholder="비밀번호"
                                                  style={{fontSize:'12px'}}
                                            />
                                            <button className="ghost" onClick={()=>{setDeleteId(null); setDeletePwd('')}}>취소</button>
                                            
                                            <div style={{color:'red', marginTop:"8px"}}>{deleteError}</div>
                                        </>
                                    ) : (
                                        <button className="danger" onClick={()=>setDeleteId(g.g_idx)}>삭제</button>
                                    )}
                                </div>  
                            )} 
                          </>      
                        )} 
                       
                    </div>    
                  ))}
            </div>
       </div> 
    )
    
}
