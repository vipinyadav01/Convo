import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Chat from './pages/Chat/Chat';
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate';
import { ToastContainer } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { AppContext } from './context/AppContext';

const App = () => {
    const navigate = useNavigate();
    const { loadUserData } = useContext(AppContext);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadUserData(user.uid);
            } else {
                console.log('No user');
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate, loadUserData]);

    return (
        <>
            <ToastContainer />
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/chat' element={<Chat />} />
                <Route path='/profile' element={<ProfileUpdate />} />
            </Routes>
        </>
    );
};

export default App;
