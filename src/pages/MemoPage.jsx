import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useMemoStore from '../store/useMemoStroe';
import { useState } from 'react';
export default function MemoPage() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const navigate = useNavigate();
    const {memos, addMemo, removeMemo, updateMemo} = useMemoStore()
    
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    
    // 수정에 필요한 변수
    const [editId, setEditId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')

    const handleAdd = ()=>{
        if(!title.trim() || !content.trim()) return

        addMemo(title, content)
        setTitle('')
        setContent('')

    }
    if(!isLoggedIn){
        return(
          <div className="page">
             <p className="muted" style={{marginBottom: '16px'}}>로그인이 필요합니다</p>
             <button onClick={()=>navigate("/login")}>로그인하러 가기</button>
          </div>
        )
    }
    // 수정 내용 저장
    const handleEditSave = ()=>{
        updateMemo(editId, {title: editTitle, content: editContent})
        setEditId(null)
    }
    // 수정 시작
    const handleEditStart = (memo)=>{
       setEditId(memo.id)
       setEditTitle(memo.title)
       setEditContent(memo.content)
    }
    return(
        <div className='page' style={{maxWidth: '400px'}}>
            <h2 style={{marginBottom:'24px'}}>메모장</h2>
            <div className='card col' style={{padding: '20px', gap: '10px', marginBottom: '28px'}}>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='제목' />
                <textarea 
                   value={content}
                   onChange={(e)=>setContent(e.target.value)}
                   placeholder='내용을 입력하세요'
                   rows={3}
                   style={{resize: 'vertical'}}
                />
                <button onClick={handleAdd} style={{alignSelf: 'flex-end', width: '80px'}}>추가</button>
            </div>
            <div className='col'>
                {memos.length === 0  && <p className='empty'>메모를 추가해보세요</p>}
                {memos.map((memo)=>(
                    <div key={memo.id} className='card' style={{padding: '16px 20px', borderRadius: '10px'}}>
                        {/* 수정 버튼을 누르면 해당 메모의 id를 editId에 저장 */}
                        {editId === memo.id ? (
                            <div className='col' style={{gap: '8px'}}>
                                <input value={editTitle} onChange={(e)=>{setEditTitle(e.target.value)}} />
                                <textarea value={editContent} 
                                onChange={(e)=>setEditContent(e.target.value)}  
                                rows={3} 
                                style={{resize: 'vertical'}} />
                           
                                <div className='row'>
                                    <button onClick={handleEditSave}>저장</button>
                                    <button className='ghost' onClick={()=>setEditId(null)}>취소</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={{fontWeight:'bold', marginBottom: '6px'}}>{memo.title}</p>
                                <p className='muted' style={{fontSize:'13px', marginBottom:'10px'}}>{memo.content}</p>
                                <p style={{color:'#334155', fontSize: '11px', marginBottom: '10px'}}>{memo.createdAt}</p>
                                <div className='row'>
                                    <button className='ghost sm' onClick={()=> handleEditStart(memo)}>수정</button>
                                    <button className='danger sm' onClick={()=>removeMemo(memo.id)}>삭제</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}