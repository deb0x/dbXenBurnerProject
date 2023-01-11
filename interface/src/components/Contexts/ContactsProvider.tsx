import { useState, useEffect } from "react";
import ContactsContext, { initialContacts } from './ContactsContext';

type Props = {
    children: JSX.Element|JSX.Element[],
};

const ContactsProvider = ( { children }: Props ) => {
    const [contacts, setContacts] = useState<any>(initialContacts.contacts);
  
    const localStorage = window.localStorage;
  
    useEffect(() => {
        const savedContacts = JSON.parse(localStorage.getItem('contacts') || 'null');
        
        if (!!savedContacts) {
            setContacts(savedContacts);
        }
    }, [localStorage]);
  
  
    useEffect(() => {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }, [contacts, localStorage]);
    
    return (
      <ContactsContext.Provider value={{ contacts, setContacts }}>
        <>{children}</>
      </ContactsContext.Provider>
    );
  };
  
  export default ContactsProvider;