import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
    collection,
    doc,
    query,
    where,
    getDocs,
    setDoc,
    updateDoc,
    arrayUnion,
    getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId, messageId, chatVisible, setChatVisible = [] } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value.trim().toLowerCase();
            if (!input) {
                setUser(null);
                setShowSearch(false);
                return;
            }

            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", input));
            const querySnap = await getDocs(q);

            if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                const searchedUser = querySnap.docs[0].data();
                const userExists = chatData.some((chat) => chat.id === searchedUser.id);

                if (!userExists) {
                    setUser(searchedUser);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setShowSearch(true);
        } catch (error) {
            setShowSearch(false);
        }
    };

    const addChat = async () => {
        if (!user) return;

        try {
            const messageRef = collection(db, "messages");
            const chatsRef = collection(db, "chats");
            const newMessage = doc(messageRef);

            await setDoc(newMessage, {
                createdAt: Date.now(),
                messages: [],
            });

            const timestamp = Date.now();

            const currentUserChatRef = doc(chatsRef, userData.id);
            const searchedUserChatRef = doc(chatsRef, user.id);

            const currentUserChatDoc = await getDoc(currentUserChatRef);
            if (!currentUserChatDoc.exists()) {
                await setDoc(currentUserChatRef, { chatsData: [] });
            }

            const searchedUserChatDoc = await getDoc(searchedUserChatRef);
            if (!searchedUserChatDoc.exists()) {
                await setDoc(searchedUserChatRef, { chatsData: [] });
            }

            await updateDoc(currentUserChatRef, {
                chatsData: arrayUnion({
                    messageId: newMessage.id,
                    lastMessage: "",
                    rid: user.id,
                    updatedAt: timestamp,
                    messageSeen: true,
                }),
            });

            await updateDoc(searchedUserChatRef, {
                chatsData: arrayUnion({
                    messageId: newMessage.id,
                    lastMessage: "",
                    rid: userData.id,
                    updatedAt: timestamp,
                    messageSeen: true,
                }),
            });


            toast.success("Chat added successfully!");
            setUser(null);
            setShowSearch(false);
            const uSnap = await getDoc(doc(db, "users", user.id));
            const uData = uSnap.data();
            setChat({
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            })
            setShowSearch(false);
            setChatVisible(true);
        } catch (error) {
            toast.error("Error adding chat");
        }
    };
    useEffect(() => {
        const chatData = chatData.map(async () => {
            if (chatUser) {
                const userRef = doc(db, "users", chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({ ...prev, userData: userData }));
            }
        });
        updateChatUserData();
    }, [chatData])
    const setChat = async (item) => {
        try {
            setMessagesId(item.messageId);
            setChatUser(item);

            const userChatsRef = doc(db, "chats", userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);

            if (userChatsSnapshot.exists()) {
                const userChatData = userChatsSnapshot.data();
                const updatedChats = userChatData.chatsData.map((chat) =>
                    chat.messageId === item.messageId
                        ? { ...chat, messageSeen: true }
                        : chat
                );

                await updateDoc(userChatsRef, {
                    chatsData: updatedChats,
                });
            }
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className={`ls ${chatVisible ? "hidden" : ""}`}>
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
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                ) : Array.isArray(chatData) && chatData.length > 0 ? (
                    chatData.map((item, index) => (
                        <div
                            onClick={() => setChat(item)}
                            key={index}
                            className={`friends ${item.messageSeen || item.messageId === messageId ? "" : "border"} ${item.messageId === messageId ? "active" : ""}`}
                        >
                            <img src={item.userData.avatar} alt="" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ margin: 0 }}>{item.userData.name}</p>
                                {item.lastMessage && (
                                    <span style={{ fontSize: '0.8em', color: '#666' }}>
                                        {item.lastMessage}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <h1 style={{ textAlign: 'center', color: '#666', marginTop: '20px', fontSize: '1.2em' }}>
                        No chats available.
                    </h1>
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
