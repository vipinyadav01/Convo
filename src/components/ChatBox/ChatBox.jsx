import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';

const ChatBox = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);

    // Format current time
    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle message submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                text: message,
                time: getCurrentTime(),
                type: 'sender',
                id: Date.now()
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newMessage = {
                    image: e.target.result,
                    time: getCurrentTime(),
                    type: 'sender',
                    id: Date.now()
                };
                setMessages([...messages, newMessage]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="chat-box">
            <div className="chat-user">
                <img src={assets.profile_img} alt="User" className="profile-pic" />
                <div className="user-info">
                    <p>
                        Vipin Yadav
                        <span className="online-status">
                            <img className="dot" src={assets.green_dot} alt="Online Status" />
                        </span>
                    </p>
                    <span className="user-status">Online</span>
                </div>
                <img src={assets.help_icon} className="help" alt="Help" />
            </div>

            <div className="chat-msg" ref={chatContainerRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={msg.type === 'sender' ? 's-msg' : 'r-msg'}>
                        {msg.image ? (
                            <div className="msg-img">
                                <img src={msg.image} alt="Shared" className="shared-image" />
                                <div className="msg-info">
                                    <img src={assets.profile_img} alt="User" />
                                    <p>{msg.time}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="msg">{msg.text}</p>
                                <div className="msg-info">
                                    <img src={assets.profile_img} alt="User" />
                                    <p>{msg.time}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>

            <form className="chat-input" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Send a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
    );
};

export default ChatBox;
