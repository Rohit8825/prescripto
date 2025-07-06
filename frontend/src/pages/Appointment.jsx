import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [slotTimeIndex, setSlotTimeIndex] = useState(null);

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvailableSlots = async () => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let allSlots = [];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        let now = new Date();
        if (now.getHours() < 10) {
          currentDate.setHours(10, 0, 0, 0);
        } else if (now.getHours() >= 21) {
          currentDate.setHours(21, 0, 0, 0);
        } else {
          currentDate.setHours(
            now.getMinutes() > 30 ? now.getHours() + 1 : now.getHours(),
            now.getMinutes() > 30 ? 0 : 30,
            0,
            0
          );
          if (currentDate.getHours() < 10) {
            currentDate.setHours(10, 0, 0, 0);
          }
        }
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      if (timeSlots.length === 0) {
        let emptyDate = new Date(today);
        emptyDate.setDate(today.getDate() + i);
        timeSlots.push({ datetime: emptyDate, time: null });
      }

      allSlots.push(timeSlots);
    }

    setDocSlots(allSlots);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/* Doctor Detail */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="w-full sm:max-w-72 rounded-lg"
              style={{ backgroundColor: '#5f6FFF' }}
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree}-{docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{' '}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots.map((items, index) => (
                <div
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? 'text-white'
                      : 'border border-gray-200'
                  }`}
                  style={
                    slotIndex === index ? { backgroundColor: '#5f6FFF' } : {}
                  }
                  key={index}
                  onClick={() => {
                    setSlotIndex(index);
                    setSlotTimeIndex(null);
                    setSlotTime('');
                  }}
                >
                  <p>
                    {items[0] &&
                      daysOfWeek[items[0].datetime.getDay()]}
                  </p>
                  <p>{items[0] && items[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots[slotIndex] &&
              docSlots[slotIndex].map(
                (item, index) =>
                  item.time && (
                    <p
                      className={
                        `text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ` +
                        (slotTimeIndex === index
                          ? 'text-white'
                          : 'text-gray-400 border border-gray-300')
                      }
                      style={
                        slotTimeIndex === index
                          ? { backgroundColor: '#5f6FFF' }
                          : {}
                      }
                      key={index}
                      onClick={() => {
                        setSlotTime(item.time);
                        setSlotTimeIndex(index);
                      }}
                    >
                      {item.time.toLowerCase()}
                    </p>
                  )
              )}
          </div>

          <button
            className="text-white text-sm font-light px-14 py-3 rounded-full my-6"
            style={{ background: '#5f6FFF' }}
          >
            Book an Appointment
          </button>
        </div>

        {/* Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
