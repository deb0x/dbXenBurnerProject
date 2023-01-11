import { useState, useEffect } from "react";
import ReadedMessagesContext, { readedMessages } from './ReadedMessagesContext';

type Props = {
    children: JSX.Element|JSX.Element[],
};

const ReadedMessagesProvider = ( { children }: Props ) => {
    const [readed, setReaded] = useState<any>(readedMessages.readed);
  
    const localStorage = window.localStorage;  
  
    useEffect(() => {
        localStorage.setItem('messages', JSON.stringify(readed));
    }, [readed, localStorage]);
    
    return (
      <ReadedMessagesContext.Provider value={{ readed, setReaded }}>
        <>{children}</>
      </ReadedMessagesContext.Provider>
    );
  };
  
  export default ReadedMessagesProvider;