import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets_frontend/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const { token, setToken, profilePic,setProfilePic } = useContext(AppContext);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
            <img onClick={() => navigate("")} className='w-44 cursor-pointer' src={assets.logo} alt="" />
            <ul className='hidden md:flex items-start gap-5 font-medium'>
                <NavLink to='/'>
                    <li className='py-1'>HOME</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5F6FFF] w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/doctors'>
                    <li className='py-1'>ALL DOCTORS</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5F6FFF] w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='/about'>
                    <li className='py-1'>ABOUT</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5F6FFF] w-3/5 m-auto hidden' />
                </NavLink>
                <NavLink to='contact'>
                    <li className='py-1'>CONTACT</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5F6FFF] w-3/5 m-auto hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-4'>
                {
                    token ?
                        <div className="relative">
                            <div
                                onClick={() => setShowDropdown(prev => !prev)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <img src={profilePic} className="w-9 rounded-full" />
                                <img src={assets.dropdown_icon} className="w-2.5" />
                            </div>

                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-2 z-20 bg-stone-100 rounded shadow-md min-w-48 p-4 flex flex-col gap-2 text-gray-600 text-base font-medium">
                                    <p
                                        className="hover:text-black cursor-pointer"
                                        onClick={() => {
                                            navigate('/my-profile');
                                            setShowDropdown(false);
                                        }}
                                    >
                                        My Profile
                                    </p>
                                    <hr className="h-px bg-gray-300 border-none" />
                                    <p
                                        className="hover:text-black cursor-pointer"
                                        onClick={() => {
                                            navigate('/my-appointment');
                                            setShowDropdown(false);
                                        }}
                                    >
                                        My Appointments
                                    </p>
                                    <hr className="h-px bg-gray-300 border-none" />
                                    <p
                                        className="hover:text-black cursor-pointer"
                                        onClick={() => {
                                            setToken(false);
                                            localStorage.clear("token");
                                            localStorage.clear("profilePic")
                                            setShowDropdown(false);
                                        }}
                                    >
                                        Logout
                                    </p>
                                </div>
                            )}
                        </div>
                        :
                        <button onClick={() => { navigate('/login') }} className='bg-[#5F6FFF] text-white px-8 py-3 rounded-full font-light hidden md:block cursor-pointer'>Create Account</button>
                }
                {/* mobile menu */}
                <img src={assets.menu_icon} className='md:hidden w-6' onClick={() => setShowMenu(true)} />

                <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
                    <div className='flex items-center justify-between px-8 py-6'>
                        <img className='w-36' src={assets.logo} alt="" />
                        <img className='w-7' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="" />
                    </div>
                    <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
                        <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded inline-block'>HOME</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded inline-block'>ALL DOCTORS</p></NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded inline-block'>ABOUT</p> </NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded inline-block'>CONTACT</p></NavLink>
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default Navbar