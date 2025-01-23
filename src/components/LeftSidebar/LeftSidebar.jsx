import React from 'react'
import "./LeftSidebar.css"
import assets from '../../assets/assets'

const LeftSidebar = () => {
    return (
        <div className='ls'>
            <div className='ls-top'>
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input type="text" placeholder="Search or start new chat" />
                </div>
            </div>
            <div className="ls-list">
                {Array(12).fill("").map((item, index) => (
                    <div key={index} className="friends">
                        <img src={assets.profile_img} alt="" />
                        <div>
                            <p>Vipin Yadav</p>
                            <span>Hello,How are you?</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeftSidebar
