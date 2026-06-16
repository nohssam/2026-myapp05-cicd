// Zustand의 create 함수와 persist 미들웨어를 가져온다
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useMemoStore = create(
    // persist로 감싸면 localStorage에 자동 저장된다
    persist(
        (set) => ({
                memos: [],
                addMemo: (title, content)=>
                    set((state)=>({
                      memos: [...state.memos,{
                        id:Date.now(),
                        title,
                        content,
                        createdAt: new Date().toLocaleDateString('ko-KR')
                      }]  
                    })),

                removeMemo: (id)=>
                    set((state)=>({
                       // 받은 id가 아닌 항목들을 모아서 새로운 배열로 만든다.
                        memos: state.memos.filter((m)=>(m.id !== id))
                    })),

                updateMemo: (id, fields)=>
                    // 받은 id의 항목을 찾아서 내용을 고치자 9 {...m, ...fields})
                    set((state)=>({
                        memos: state.memos.map((m)=>(m.id === id) ? {...m, ...fields} : m)
                    })),
            }),
        { name: 'memo-storage' } // localStorage 키 이름
    )
)

export default useMemoStore