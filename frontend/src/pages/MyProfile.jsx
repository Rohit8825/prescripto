import React, { useContext, useState,useEffect,useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios';
import { toast } from 'react-toastify';
const MyProfile = () => {
   const navigate = useNavigate();
  const { token, setToken, backendUrl, profilePic, setProfilePic } = useContext(AppContext);

  const getProfile = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", { headers: { token: localStorage.getItem("token") } });
      // console.log(data);
      if (data.success) {
        setuserData(data.userData);
        localStorage.setItem("profilePic", data.userData.image);
        setProfilePic(localStorage.getItem("profilePic"));
      }
      else toast.error(data.message);
    } catch (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    getProfile();
  }, [token]);

  const updateProfile = async () => {
    try {
      toast.loading("Saving Information");
      const formData = new FormData();

      // Append fields
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("dob", userData.dob);
      formData.append("gender", userData.gender);
      formData.append("address", JSON.stringify(userData.address)); // if address is an object

      if (file) formData.append("image", file); // 'image' must match field name in multer


      // console.log(formData);

      const { data } = await axios.post(backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token: localStorage.getItem("token") } },
      )
      toast.dismiss();
      if (data.success) toast("Updated Successfully")
      else toast.error(data.message);
      getProfile();
    } catch (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate])

  const fileInputRef = useRef(null);


  const [userData, setuserData] = useState({
    name: "",
    image: null,
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: ""
    },
    gender: "",
    dob: ""
  })

  // const [isEdit, setIsEdit] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [file, setFile] = useState(null);
   return (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      <img className='w-36 rounded' src={profilePic} alt="" />
      {
        isEdit ?
          <input
            type="file"
            accept='image/*'
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (selectedFile) {
                setFile(selectedFile); // stores file for upload
                setProfilePic(URL.createObjectURL(selectedFile)); // shows preview
              }
            }}
            ref={fileInputRef}
            className='border border-stone-300 w-50 rounded px-2 bg-stone-50'
          />
          : null
        }
        {
          isEdit ?
              <input
              className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
              type="text"
              value={userData.name || ""}
              placeholder="Enter your name"
              onChange={e => setuserData(prev => ({ ...prev, name: e.target.value }))}
              /> :
              <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
            }
            <hr className='bg-zinc-400 h-[1px] border-none' />
            <div>
            <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
            <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
              <p className='font-medium'>Email id:</p>
              <p className='text-blue-500'>{userData.email}</p>
              <p>Phone:</p>
              {
              isEdit ?
                <input className='bg-gray-100 max-w-52' type="text" placeholder={userData.phone} onChange={e => setuserData(prev => ({ ...prev, phone: e.target.value }))} /> :
                <p className='text-blue-400'>{userData.phone}</p>
              }
              <p className='font-medium'>Address:</p>
              {
              isEdit ?
                <p>
                <input className='bg-gray-50' type="text" placeholder={userData.address?.line1 || ""} onChange={e => setuserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} />
                <br />
                <input className='bg-gray-50' type="text" placeholder={userData.address?.line2 || ""} onChange={e => setuserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} />
                </p> :
                <div>
                <p className='text-gray-500'>{userData.address?.line1 || ""}</p>
                {/* <br /> */}
                <p className='text-gray-500'>{userData.address?.line2 || ""}</p>
              </div>
          }

        </div>
      </div>
      <div>
        <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender:</p>
          {isEdit ?
            <select className='max-w-20 bg-gray-100' value={userData.gender || ""} onChange={(e) => setuserData(prev => ({ ...prev, gender: e.target.value }))}>
              <option value="">Not Selected</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select> :
            <p className='font-medium'>
              {userData.gender}
            </p>
          }
          <p>Date of Birth:</p>
          {
            isEdit ?
              <input className='max-w-28 bg-gray-100' type="date" value={userData.dob || ""} onChange={(e) => (setuserData(prev => ({ ...prev, dob: e.target.value })))} /> :
              <p className='text-gray-400'>{userData.dob}</p>
          }
        </div>
      </div>
      <div className='mt-10'>
        {isEdit ?
          <button className='border border-[#5f6fff] px-8 py-2 rounded-full hover:bg-[#5f6fff] hover:text-white transition-all duration-300' onClick={() => { setIsEdit(false); updateProfile() }}>
            Save Information
          </button> :
          <button className='border border-[#5f6fff] px-8 py-2 rounded-full hover:bg-[#5f6fff] hover:text-white transition-all duration-300' onClick={() => setIsEdit(true)}>
            Edit Information
          </button>
        }
      </div>
    </div>
  )
}

export default MyProfile