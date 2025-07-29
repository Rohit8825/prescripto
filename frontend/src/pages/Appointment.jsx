import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctorData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

  const getAvailableSolts = async () => {
  setDocSlots([])

  const today = new Date()

  for (let i = 0; i < 7; i++) {
    // build a date for day i
    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() + i)

    // opening & closing boundaries for that date
    const open  = new Date(dayDate)
    const close = new Date(dayDate)
    open.setHours(10, 0, 0, 0)
    close.setHours(21, 0, 0, 0)

    let cursor

    if (i === 0) {
      // today: either opening, or next half‑hour after now, or skip if past closing
      const now = new Date()
      if (now >= close) {
        // no slots left today
        continue
      } else if (now < open) {
        cursor = open
      } else {
        // round now up to next 30‑minute mark
        const mins = now.getMinutes()
        const addHour = mins >= 30 ? 1 : 0
        const baseMin = mins >= 30 ? 0 : 30
        cursor = new Date(now)
        cursor.setHours(now.getHours() + addHour, baseMin, 0, 0)
      }
    } else {
      // future days always start at opening
      cursor = open
    }

    // now loop from cursor -> close in 30‑minute jumps
    const slots = []
    while (cursor < close) {
      const day   = cursor.getDate()
      const mon   = cursor.getMonth() + 1
      const yr    = cursor.getFullYear()
      const key   = `${day}_${mon}_${yr}`
      const time  = cursor.toLocaleTimeString([], {
        hour:   '2-digit',
        minute: '2-digit'
      })

      if (!docInfo?.slots_booked?.[key]?.includes(time)) {
        slots.push({ datetime: new Date(cursor), time })
      }

      cursor = new Date(cursor.getTime() + 30 * 60 * 1000)
    }

    if (slots.length) {
      setDocSlots(prev => [...prev, slots])
    }
  }
}



    const bookAppointment = async () => {

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

         const slotDate = `${day}_${month}_${year}`
        try {

            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                getDoctorData()
                navigate('/my-appointment')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    return docInfo ? (
        <div>
  {/* ---------- Doctor Details ----------- */}
  <div className='flex flex-col sm:flex-row gap-4'>
    <div>
      <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
    </div>

    <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
      <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
        {docInfo.name}
        <img className='w-5' src={assets.verified_icon} alt="" />
      </p>

      <div className='flex items-center gap-2 mt-1 text-gray-600'>
        <p>{docInfo.degree} - {docInfo.speciality}</p>
        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
      </div>

      <div>
        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>
          About
          <img className='w-3' src={assets.info_icon} alt="" />
        </p>
        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
      </div>

      <p className='text-gray-600 font-medium mt-4'>
        Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span>
      </p>
    </div>
  </div>

  {/* Booking slots */}
  <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
    <p>Booking slots</p>

    <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
      {docSlots.length && docSlots.map((item, index) => (
        <div
          onClick={() => setSlotIndex(index)}
          key={index}
          className={`text-center py-6 min-w-16 rounded-full cursor-pointer transition 
          ${slotIndex === index 
            ? 'bg-[#5f6FFF] text-white hover:brightness-90' 
            : 'border border-[#DDDDDD] hover:border-[#5f6FFF] hover:text-[#5f6FFF]'}`}
        >
          <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
          <p>{item[0] && item[0].datetime.getDate()}</p>
        </div>
      ))}
    </div>

    <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
      {docSlots.length && docSlots[slotIndex].map((item, index) => (
        <p
          onClick={() => setSlotTime(item.time)}
          key={index}
          className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition
          ${item.time === slotTime 
            ? 'bg-[#5f6FFF] text-white hover:brightness-90' 
            : 'text-[#949494] border border-[#B4B4B4] hover:border-[#5f6FFF] hover:text-[#5f6FFF]'}`}
        >
          {item.time.toLowerCase()}
        </p>
      ))}
    </div>

    <button
      onClick={bookAppointment}
      className='bg-[#5f6FFF] text-white text-sm font-light px-20 py-3 rounded-full my-6 transition hover:brightness-90 hover:shadow-md'
    >
      Book an appointment
    </button>
  </div>

  {/* Listing Releated Doctors */}
  <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
</div>

    ) : null
}

export default Appointment

