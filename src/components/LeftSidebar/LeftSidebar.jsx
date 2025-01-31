import React, { useContext, useState, useEffect } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { collection, doc, query, serverTimestamp, where, getDocs, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", input.toLowerCase()));
            const querySnap = await getDocs(q);
            if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                setUser(querySnap.docs[0].data());
            } else {
                setUser(null);
            }
            setShowSearch(true);
        } catch (error) {
            console.error(error);
            setShowSearch(false);
        }
    }

    const addChat = async () => {
        const messageRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessage = doc(messageRef);
            await setDoc(newMessage, {
                createAt: serverTimestamp(),
                messages: []
            });
            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessage.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });
            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessage.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });
        } catch (error) {
            toast.error("Error adding chat");
            console.error(error);
        }
    }

    return (
        <div className="ls">
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo || "/placeholder.svg"} className="logo" alt="Logo" />
                    <div className="menu">
                        <img src={assets.menu_icon || "/placeholder.svg"} alt="Menu Icon" />
                        <div className="sub-menu">
                            <p onClick={() => navigate("/profile")}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon || "/placeholder.svg"} alt="Search Icon" />
                    <input onChange={inputHandler} type="text" placeholder="Search or start new chat" />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user ? (
                    <div onClick={addChat} className="friends add-user">
                        <img src={user.avatar || "/placeholder.svg"} alt="" />
                        <p>{user.name}</p>
                    </div>
                ) : (
                    Array.from({ length: 12 }, (_, index) => (
                        <div key={index} className="friends">
                            <img src={assets.profile_img || "/placeholder.svg"} alt="Profile" />
                            <div>
                                <p>Vipin Yadav</p>
                                <span>Hello, How are you?</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
