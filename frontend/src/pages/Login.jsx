import React, { useState } from 'react'

const Login = () => {
  const [state,setState]=useState('Sign Up')
  const [password,setPassword]=useState('')
  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const onSubmitHandler= async (event)=>{
    event.preventDefault()
  }
  return (
   <form onSubmit={onSubmitHandler} className='min-h-[80px] flex items-center'>
    <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg' >
      <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
      <p>Please {state === 'Sign Up' ? "Sign Up" : "log in"} to book appointment</p>
      {
        state==="Sign Up" && <div className='w-full'>
        <p>Full Name</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} required />
      </div>
      }
  
      <div className='w-full'>
        <p>Email</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} required />
      </div>

      <div className='w-full'>
        <p>Password</p>
        <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value={password} required />
      </div>
      <button className='bg-[#5f6FFF] text-white w-full py-2 rounded-md text-base '>{state === 'Sign Up' ? "Create Account" : "Login"}</button>
      {
        state === "Sign Up"
        ? <p>Already have an account? <span onClick={()=>setState('Login')} className='text-[#5f6FFF] underline cursor-pointer'>Login here</span></p>
        : <p>Create an account?       <span onClick={()=>setState('Sign Up')}className='text-[#5f6FFF] underline cursor-pointer'>click here</span> </p>
      }
    </div>
   </form>
  )
}

export default Login