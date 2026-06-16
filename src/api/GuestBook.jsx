import {api} from "./Http"

export const guestbookList = () =>
    api.get("/guestbook/list")

export const guestbookInsert = (gvo) =>
    api.post("/guestbook/insert", gvo)

export const guestbookUpdate = (gvo) =>
    api.post("/guestbook/update" ,gvo)

export const guestbookDelete = (g_idx, g_pwd) =>
    api.post(`/guestbook/delete`, {g_idx, g_pwd})