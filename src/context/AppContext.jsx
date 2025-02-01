import { createContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState([]);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);

    const loadUserData = async (uid) => {
        if (!uid) return;

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return;

            const userInfo = userSnap.data();
            setUserData(userInfo);

            if (userInfo.avatar && userInfo.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            await updateDoc(userRef, { lastSeen: Date.now() });
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                loadUserData(user.uid);
            } else {
                setUserData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userData) return;

        const chatRef = doc(db, "chats", userData.id);
        const unSub = onSnapshot(chatRef, async (snap) => {
            if (!snap.exists()) {
                console.error("Chat document does not exist");
                setChatData([]);
                return;
            }

            const chatItems = snap.data().chatsData;
            if (!Array.isArray(chatItems) || chatItems.length === 0) {
                console.error("chatsData is not an array, is empty, or is undefined");
                setChatData([]);
                return;
            }

            const tempData = await Promise.all(
                chatItems.map(async (item) => {
                    if (!item.rid) return null;

                    try {
                        const userRef = doc(db, "users", item.rid);
                        const userSnap = await getDoc(userRef);
                        if (!userSnap.exists()) {
                            console.error("User document does not exist for rid:", item.rid);
                            return null;
                        }
                        const userData = userSnap.data();
                        return { ...item, userData };
                    } catch (err) {
                        console.error("Error fetching user data:", err);
                        return null;
                    }
                })
            );

            setChatData(tempData.filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => unSub();
    }, [userData]);

    const value = {
        userData,
        setUserData,
        chatData,
        setChatData,
        loadUserData,
        messagesId,
        setMessagesId,
        messages,
        setMessages,
        chatUser,
        setChatUser,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
