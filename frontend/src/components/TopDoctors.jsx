import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';


const TopDoctors = () => {
   const navigate=useNavigate()
   const {doctors}=useContext(AppContext)
return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
        <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
        <p className='sm:w-1/3 text-center text-sm'>Simply brose through our extensive list of trusted doctors.</p>
        <div className='w-full grid grid-cols-1 sm:grid-cols-5 sm:grid-rows-2 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
            {doctors.slice(0,10).map((item, index) => (
                <div onClick={()=>navigate(`/appointment/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500' key={index}>
                    <img className='bg-blue-50' src={item.image} alt={item.name} />
                    <div className='p-4'>
                        <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'}`}>
                           <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></p>
                                              <p className={`font-semibold ${item.available ? 'text-green-600 bg-green-100 px-2 py-0.5 rounded' : 'text-red-600 bg-red-100 px-2 py-0.5 rounded'}`}>
                                                {item.available ? 'Available' : 'Not Available'}
                                              </p>
                        </div>
                        <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                        <p className='text-gray-600 text-sm'>{item.speciality}</p>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={()=>{navigate('/doctors');scrollTo(0,0)}} className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
    </div>
);
};

export default TopDoctors;
