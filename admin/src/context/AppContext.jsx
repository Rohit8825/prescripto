import { createContext } from "react";

export const AppContext=createContext()
const currency='$';
const AppContextProvider=(props)=>{

    const calculateAge=(dob)=>{
        const today=new Date();
        const birthDate=new Date(dob);
        let age=today.getFullYear()-birthDate.getFullYear();
        return age;
    }
  const months=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Nov","Dec"]
  const slotDateFormat=(slotDate)=>{
    const dateArray=slotDate.split('_')
    return dateArray[0]+" "+months[Number(dateArray[1])]+" "+dateArray[2];
  }
    const value={
        calculateAge,slotDateFormat,currency
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider