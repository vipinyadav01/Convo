import React, { useContext, useEffect, useState, useRef } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

const ChatBox = () => {
    const { userData, chatUser, messagesId } = useContext(AppContext);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const img = new Image();
                    img.src = e.target.result;
                    await new Promise((resolve) => (img.onload = resolve));
                    const canvas = document.createElement('canvas');
                    const maxSize = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height && width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedImage = canvas.toDataURL('image/jpeg', 0.6);

                    if (messagesId) {
                        await updateDoc(doc(db, "messages", messagesId), {
                            messages: arrayUnion({
                                sId: userData.id,
                                image: compressedImage,
                                createdAt: new Date()
                            })
                        });
                        updateLastMessage("[Image]");
                    } else {
                        toast.error("Message ID is not set.");
                    }
                } catch (error) {
                    toast.error(error.message);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const updateLastMessage = async (lastMessage) => {
        if (!messagesId) {
            toast.error("Message ID is not set.");
            return;
        }

        const userIDs = [chatUser.rId, userData.id];
        for (const id of userIDs) {
            const userChatsRef = doc(db, "chats", id);
            const userChatsSnapshot = await getDoc(userChatsRef);

            if (userChatsSnapshot.exists()) {
                const userChatData = userChatsSnapshot.data();
                const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);

                if (chatIndex !== -1) {
                    userChatData.chatsData[chatIndex].lastMessage = lastMessage.slice(0, 30);
                    userChatData.chatsData[chatIndex].updatedAt = Date.now();
                    if (userChatData.chatsData[chatIndex].rId === userData.id) {
                        userChatData.chatsData[chatIndex].messageSeen = false;
                    }

                    await updateDoc(userChatsRef, {
                        chatsData: userChatData.chatsData
                    });
                } else {
                    toast.error("Chat index not found.");
                }
            } else {
                toast.error("User chat snapshot does not exist.");
            }
        }
    };

    const sendMessage = async () => {
        try {
            if (input.trim() && messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                });
                updateLastMessage(input);
                setInput('');
            } else {
                toast.error("Message ID is not set or input is empty.");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, "messages", messagesId), (doc) => {
                if (doc.exists()) {
                    const messagesData = doc.data().messages;
                    setMessages(messagesData ? messagesData.reverse() : []);
                }
            });

            return () => unSub();
        }
    }, [messagesId]);

    return chatUser ? (
        <div className="chat-box">
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="User" className="profile-pic" />
                <div className="user-info">
                    <p>
                        {chatUser.userData.name}
                        <span className="online-status">
                            <img className="dot" src={assets.green_dot} alt="" />
                        </span>
                    </p>
                    <span className="user-status">Online</span>
                </div>
                <img src={assets.help_icon} className="help" alt="Help" />
            </div>

            <div className="chat-msg" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
                        <div className="msg-info">
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="User" />
                            <p>{msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString() : "Time N/A"}</p>
                        </div>
                        {msg.image ? (
                            <img src={msg.image} alt="Shared" className="shared-image" />
                        ) : (
                            <p className="msg">{msg.text}</p>
                        )}
                    </div>
                ))}
            </div>

            <form className="chat-input" onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
            }}>
                <input
                    type="text"
                    placeholder="Send a message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <input
                    type="file"
                    id="image"
                    accept="image/png, image/jpeg"
                    hidden
                    onChange={handleImageUpload}
                />
                <label htmlFor="image" className="upload-btn">
                    <img src={assets.gallery_icon} alt="Upload" />
                </label>
                <button type="submit" className="send-btn">
                    <img src={assets.send_button} alt="Send" />
                </button>
            </form>
        </div>
    ) : (
        <div className='chat-welcome'>
            <img src={assets.logo_icon} alt="" />
            <p>Chat Any time any Where</p>
        </div>
    );
};

export default ChatBox;
