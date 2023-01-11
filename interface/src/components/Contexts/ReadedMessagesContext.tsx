import { createContext } from "react";

type ReadedMessages = {
    readed: string[],
    setReaded: (_values: any) => void
}

export const readedMessages: ReadedMessages = {
    readed: JSON.parse(localStorage.getItem('messages') || '[]'),
    setReaded: (_values: any) => {}
};

const ReadedMessagesContext = createContext(readedMessages);
export default ReadedMessagesContext;