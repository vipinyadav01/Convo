import React from 'react'
import "./RightSidebar.css"
import assets from "../../assets/assets"

const RightSidebar = () => {
    return (
        <div className='rs'>
            <div className="rs-profile">
                <img src={assets.profile_img} alt="" />
                <h3>Vipin Yadav <img src={assets.green_dot} className='dot' alt='' /></h3>
                <p>Hey, I am Vipin Yadav. I'm using the chat app Convo, and I am a Software Developer.</p>
            </div>
            <hr />
            <div className='rs-media'>
                <p>Media</p>
                <div>
                    <img src={assets.pic1} alt="" />
                    <img src={assets.pic2} alt="" />
                    <img src={assets.pic3} alt="" />
                    <img src={assets.pic4} alt="" />
                    <img src={assets.pic1} alt="" />
                    <img src={assets.pic2} alt="" />
                </div>
            </div>
            <button>Logout</button>
        </div>
    )
}

export default RightSidebar
