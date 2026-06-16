// Zustand의 create 함수와 persist 미들웨어를 가져온다
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useTodoStore = create(
    // persist로 감싸면 localStorage에 자동 저장된다
    persist(
        (set) => ({
           todos: [],

            addTodo:(text) =>
                set((state)=>({
                    todos: [...state.todos, {id: Date.now(), text, done: false}]
                })),

            removeTodo:(id) =>
                set((state)=>({
                    // 받은 id가 아닌 항목들을 모아서 새로운 배열로 만든다.
                    todos: state.todos.filter((todo)=> todo.id !== id)
                })),

            toggleTodo:(id) =>
                set((state)=>({
                    todos: state.todos.map((todo) => 
                     todo.id === id ? {...todo, done: !todo.done} : todo
                    )
                }))
            
            }),
        { name: 'todo-storage' } // localStorage 키 이름
    )
)

export default useTodoStore