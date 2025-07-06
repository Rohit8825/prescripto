import React, { useState } from 'react'
import {assets} from '../assets/assets_frontend/assets'
import { NavLink, useNavigate } from 'react-router-dom'
const Navbar = () => {
    const navigate=useNavigate()
    const [showMenu,setShowMenu]=useState(false)
    const [token,setToken]=useState(true)
return (
    <div className='flex flex-col md:flex-row items-center justify-between text-sm py-4 mb-5 border-b-gray-400 relative'>
         <img onClick={()=>navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />
         <ul className='hidden md:flex items-start gap-5 font-medium flex-wrap'>
            <NavLink to='/'>
                    <li className='py-1'>HOME</li>
                    <hr className='border-none outline-none h-0.5 w-3/5 m-auto hidden' style={{ backgroundColor: '#5f6FFF' }}/>
            </NavLink>
             <NavLink to='/doctors'>
                    <li className='py-1'>ALL DOCTORS</li>
                     <hr className='border-none outline-none h-0.5 w-3/5 m-auto hidden' style={{ backgroundColor: '#5f6FFF' }} />
            </NavLink>
             <NavLink to='/about'>
                    <li className='py-1'>ABOUT</li>
                    <hr className='border-none outline-none h-0.5 w-3/5 m-auto hidden' style={{ backgroundColor: '#5f6FFF' }}/>
            </NavLink>
             <NavLink to='/contact'>
                    <li className='py-1'>CONTACT</li>
                    <hr className='border-none outline-none h-0.5 w-3/5 m-auto hidden' style={{ backgroundColor: '#5f6FFF' }} />
            </NavLink>
         </ul>
         <div className='flex items-center gap-4'>
            {
                 token ? (
                     <div
                         className='flex items-center gap-2 cursor-pointer relative'
                         onMouseEnter={() => setShowMenu(true)}
                         onMouseLeave={() => setShowMenu(false)}
                     >
                            <img className='w-8 rounded-full' src={assets.profile_pic} alt="" />
                            <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                            {showMenu && (
                                <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20'>
                                    <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                                            <p onClick={()=>navigate('my-profile')} className='cursor-pointer hover:text-black'>My Profile</p>
                                            <p onClick={()=>navigate('my-appointment')} className='cursor-pointer hover:text-black'>My Appointments</p>
                                            <p onClick={()=>setToken(false)} className='cursor-pointer hover:text-black'>Logout</p>
                                    </div>
                                </div>
                            )}
                     </div>
                 ) : (
                     <button onClick={()=>navigate('/login')} className='text-white px-8 py-3 rounded-full font-light hidden md:block' style={{ backgroundColor: '#5f6FFF' }}>Create account</button>
                 )
            } 
            {/* Mobile Menu Icon in Top Right */}
            <img
                onClick={()=>setShowMenu(true)}
                className='w-6 md:hidden absolute right-4 top-4 z-30'
                src={assets.menu_icon}
                alt=""
            />
            {/* Mobile Menu */}
             <div className={`fixed top-0 right-0 ${showMenu ? 'w-full h-full' : 'w-0 h-0'} md:hidden z-20 overflow-hidden bg-white transition-all`} > 
                <div className='flex items-center justify-between px-5 py-6'>
                    <img className='w-36' src={assets.logo} alt="" />
                    <img className='w-7' onClick={()=>setShowMenu(false)} src={assets.cross_icon} alt="" />
                </div>
                <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
                   <NavLink  onClick={()=>setShowMenu(false)} to={'/'}> <p className='px-4 py-2 rounded  inline-block'>Home</p></NavLink>
                   <NavLink   onClick={()=>setShowMenu(false)} to={'/doctors'} > <p className='px-4 py-2 rounded  inline-block'>All Doctors</p></NavLink>
                    <NavLink  onClick={()=>setShowMenu(false)} to={'/about'}> <p className='px-4 py-2 rounded  inline-block'>About</p> </NavLink>
                    <NavLink onClick={()=>setShowMenu(false)} to={'/contact'} > <p className='px-4 py-2 rounded  inline-block'>Contact</p></NavLink>
                    {token && (
                        <>
                            <NavLink onClick={()=>setShowMenu(false)} to={'/my-profile'}> <p className='px-4 py-2 rounded inline-block'>My Profile</p></NavLink>
                            <NavLink onClick={()=>setShowMenu(false)} to={'/my-appointment'}> <p className='px-4 py-2 rounded inline-block'>My Appointments</p></NavLink>
                            <p onClick={() => { setToken(false); setShowMenu(false); }} className='px-4 py-2 rounded inline-block cursor-pointer hover:text-black'>Logout</p>
                        </>
                    )}
                    {!token && (
                        <NavLink onClick={()=>setShowMenu(false)} to={'/login'}> <p className='px-4 py-2 rounded inline-block'>Create account</p></NavLink>
                    )}
                </ul>
             </div>
         </div>
         
    </div>
)
}

export default Navbar