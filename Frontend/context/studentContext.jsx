import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const StudentContext = createContext({});

export const StudentProvider = ({ children }) => {
    const [student, setStudent] = useState(null);
    
    return (
        <StudentContext.Provider value={}>
        {children}
        </StudentContext.Provider>
    );
    }