import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useTodoStore from '../store/useTodoStore';
import { useState } from 'react';

export default function TodoPage() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const navigate = useNavigate();

    const {todos, addTodo, removeTodo, toggleTodo} = useTodoStore()
    const remaining = todos.filter((k)=> !k.done).length

    const [input, setInput] = useState('')

    const handleAdd = () =>{
        if(!input.trim())  return
        addTodo(input)
        setInput('')
    }
    if(!isLoggedIn){
        return(
          <div className="page">
             <p className="muted" style={{marginBottom: '16px'}}>로그인이 필요합니다</p>
             <button onClick={()=>navigate("/login")}>로그인하러 가기</button>
          </div>
        )
    }
    return(
        <div className='page' style={{maxWidth: '400px'}}>
            <div className='row' style={{justifyContent: 'space-between', marginBottom: '24px'}}>
                <h2>Todo 리스트</h2>
                <span className='muted' style={{fontSize: '13px'}}>남은 항목 {remaining} 개</span>
            </div>
            <div className='row' style={{marginBottom: '24px'}}>
                <input
                   value={input} 
                   onChange={(e)=>setInput(e.target.value)}
                   onKeyDown={(e)=> e.key === 'Enter' && handleAdd()}
                   placeholder='할 일을 입력하세요' />
                <button onClick={handleAdd} style={{minWidth: '64px'}}>추가</button>  
            </div>
            <div className='col' style={{gap:'8px'}}>
                {todos.length === 0 && <p className='empty'> 할 일을 추가해보세요</p>}
                {todos.map((todo)=>(
                    <div
                        key={todo.id}
                        className='card row'
                        style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            gap: '10px',
                            border: `1px solid ${todo.done ? '#1e293b' : '#334155'}`
                        }}>
                        <input 
                            type='checkbox'
                            checked={todo.done}
                            onChange={()=> toggleTodo(todo.id)}
                            style={{width:'16px', height: '16px', cursor: 'pointer'}}
                        />  
                        <span
                            onClick={()=> toggleTodo(todo.id)}
                            style={{
                                flex:1,
                                cursor: 'pointer',
                                textDecoration: todo.done ? 'line-through' : 'none',
                                color: todo.done ? '#475569' : '#e2e8f0'
                            }}
                        >{todo.text}</span>  
                        <button className='danger sm' onClick={()=>removeTodo(todo.id)}>삭제</button>
                    </div>
                ))}
            </div>
        </div>
    );
}