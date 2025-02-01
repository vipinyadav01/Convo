import React, { useContext, useEffect, useState } from 'react';
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
    const { chatUser, messages } = useContext(AppContext);
    const [msgImages, setMsgImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            let tempVal = [];
            messages.forEach((msg) => {
                if (msg.image) {
                    tempVal.push(msg.image);
                }
            });
            setMsgImages(tempVal);
            setLoading(false);
        } catch (err) {
            setError("Failed to load images");
            setLoading(false);
        }
    }, [messages]);

    if (loading) {
        return <div className='rs'>Loading...</div>;
    }

    if (error) {
        return <div className='rs'>{error}</div>;
    }

    return chatUser ? (
        <div className='rs'>
            <div className="rs-profile">
                <img src={chatUser?.userData?.avatar} alt="" />
                <h3>{chatUser?.userData?.name} <img src={assets.green_dot} className='dot' alt='' /></h3>
                <p>{chatUser?.chatData?.bio}</p>
            </div>
            <hr />
            <div className='rs-media'>
                <p>Media</p>
                <div className='media-grid'>
                    {msgImages.length > 0 ? (
                        msgImages.map((url, index) => (
                            <img onClick={() => window.open(url)} key={index} src={url} alt='media' />
                        ))
                    ) : (
                        <p>No media available.</p>
                    )}
                </div>
            </div>
            <button onClick={() => logout()}>Logout</button>
        </div>
    ) : (
        <div className='rs'>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}

export default RightSidebar;
