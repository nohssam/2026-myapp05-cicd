import { useStore } from "zustand";
import useAuthStore from "../store/useAuthStore";
import useMemoStore from "../store/useMemoStroe";
import { Link } from "react-router-dom";
import useTodoStore from "../store/useTodoStore";

export default function HomePage() {
    // 전체구독: 스토어의 모든 상태를 구독
    // 어떤값이라도 바뀌면 컴포넌트가 리렌더링 된다.
    const  {isLoggedIn, user} = useAuthStore()
    // 선택구독: todos가 바뀔 때만 리렌더링 된다.
    const todos = useTodoStore((state)=>state.todos)
      // 선택구독: memos가 바뀔 때만 리렌더링 된다.
    const memos = useMemoStore((state)=>state.memos)
    // 완료된 개수 : done = true
    const doneTodos = todos.filter((k)=>k.done).length
    return(
        <div className="page" style={{maxWidth:'400px'}}>
           <h1 style={{fontSize:'24px', marginBottom:'8px'}}>
                {isLoggedIn ? `${user.m_name}님 환영합니다. `  : '안녕하세요!'}
           </h1>
           <p className="muted" style={{marginBottom:'32px'}}>
                {isLoggedIn ? `Zustand 연습 중`  : '로그인 후 모든 기능을 사용할 수 있어요.'}
           </p>

           {isLoggedIn ? (
            <>
              <div style={{display:'flex', gap:'16px', flexWrap: 'wrap', marginBottom:'32px'}}>
                  <div className="card" style={{padding:'20px 24px', minWidth:'160px'}}>
                    <p className="muted" style={{fontSize:'12px', marginBottom:'6px'}}>Todo</p>
                    <p style={{fontSize:'28px', fontWeight:'bold'}}>{todos.length}</p>
                    <p style={{fontSize:'12px', color:'#64748b'}}>완료 {doneTodos}개</p>
                  </div>
                  <div className="card" style={{padding:'20px 24px', minWidth:'160px'}}>
                    <p className="muted" style={{fontSize:'12px', marginBottom:'6px'}}>메모</p>
                    <p style={{fontSize:'28px', fontWeight:'bold'}}>{memos.length}</p>
                    <p style={{fontSize:'12px', color:'#64748b'}}>저장된 메모</p>
                  </div>
                
              </div> 
              <div className="row" style={{gap:'10px', flexWrap: 'wrap'}}>
                    <Link to="/todo"><button>Todo 바로가기</button></Link> 
                    <Link to="/memo"><button className="ghost">메모 바로가기</button></Link> 
              </div>
            </>
           ):(
            <Link to="/login"><button>로그인하기</button></Link> 
           )}
        </div>
    );
}