import {parse, isLastDayOfMonth, isFirstDayOfMonth, isFriday, isSaturday }  from "date-fns" 
import cloneDeep from "lodash/cloneDeep"
// import Util from "../../VolumeRisksTool/Forecast/utils"
let weekNumber = 0
export default class CalendarUtils extends Object {
        constructor(props){
            super(props)
        }

        static getBtwDates(firstDateStr, lastDateStr){
            let tempDate = parse(firstDateStr)
                  let lastDate = parse(lastDateStr)
                  const listOfDates = []
                  while(tempDate.getTime() <=  lastDate.getTime()){
                      listOfDates.push(tempDate.getFullYear()+"-"+(
                      (tempDate.getMonth() < 9 && 
                          tempDate.getMonth().toString().length === 1 )? "0"+(
                              tempDate.getMonth()+1) : (tempDate.getMonth()+1))+"-"+(
                      (tempDate.getDate() < 10 && 
                      tempDate.getDate().toString().length === 1)?("0"+tempDate.getDate()):
                      tempDate.getDate()));
                      tempDate.setDate(tempDate.getDate()+1)
                  }
                  return listOfDates;
          
        }
        static getRandomNumber(){
            return Math.floor((Math.random() * 10000000000) + 1);
        }
        static getDummyDatesBeforeFirstDayOFMnth(tempDate){
            tempDate.setDate(tempDate.getDate() - 1)
            const beforedates = []
            while(!isFriday(tempDate)){
                const dateNumber = tempDate.getDate()
                // const day = tempDate.getDay()
                beforedates.push({
                    // day : day,
                    dateNumber : dateNumber,
                    real : false
                })
                tempDate.setDate(tempDate.getDate() - 1)
            }
            return beforedates.reverse()
        }
        static getDummyDatesAfterLastDayOFMnth(tempDate){
            tempDate.setDate(tempDate.getDate() + 1)
            const afterdates = []
            while(!isSaturday(tempDate)){
                const dateNumber = tempDate.getDate()
                // const day = tempDate.getDay()
                afterdates.push({
                    // day : day,
                    dateNumber : dateNumber,
                    real : false
                })
                tempDate.setDate(tempDate.getDate() + 1)
            }
            return afterdates
        }
        static isValidDate(date){
            if(date ){
                if(date instanceof Date){
                    return true
                }else if(!isNaN(date)){
                    return false
                }else if((new Date(date)) === "Invalid Date"){
                    return false
                }else if((new Date(date)) instanceof Date){
                    return true
                }else{
                    return false
                }
            }else {
                return false
            }
        }
        static getDateYYMMDD(date){
            if(date === "Invalid Date"){
                return undefined
            }
            date = date ? parse(cloneDeep(date)) : new Date()
            let month = (date.getMonth() + 1)
            let d = date.getDate()
            return date.getFullYear()+"-"+ ( month >= 10? (month) : "0"+(month)  ) +"-"+( d >= 10? d : "0"+(d)) 
        }

        static getStartEndDateObj(minDate, maxDate){
            let startDate = parse("02-01-"+(minDate.getFullYear() - 1))
        //    startDate.setFullYear(startDate.getFullYear() -1)
           let endDate = parse("01-31-"+(maxDate.getFullYear() + 1))
        //    endDate.setFullYear(endDate.getFullYear() + 1)
           return {startDate, endDate}
        }
        /*eslint-disable*/
        static getDateForYear({calendarStartDate = "02-01-"+((new Date()).getFullYear())  , 
                                calendarEndDate = "01-31-"+((new Date()).getFullYear()+3)}){
           let datesList = {}
           const {startDate, endDate} = this.getStartEndDateObj(parse(calendarStartDate), parse(calendarEndDate))
           const tempDate = cloneDeep(startDate)

           while(tempDate.getTime() <= endDate.getTime()){
            const year = tempDate.getFullYear()
            const month = tempDate.getMonth()
            const dateNumber = tempDate.getDate()
            // const day = tempDate.getDay()
            if(datesList[year] === undefined){
                datesList[year] = {}
            }
            
            if(datesList[year][month] === undefined){
                datesList[year][month] = []
            }
            
            if(isLastDayOfMonth(tempDate) && !isFriday(tempDate)){
                const dummyDates = CalendarUtils.getDummyDatesAfterLastDayOFMnth( cloneDeep(tempDate))
                if(isSaturday(tempDate)){
                    datesList[year][month].push({
                        dateNumber : dateNumber,
                        real : false,
                        weekNumber :CalendarUtils.getWeekNumber(tempDate),
                        weekStartDate : CalendarUtils.getDateYYMMDD(tempDate),
                        isWeekNumber : true,
                        weekFormat : year+"-"+weekNumber,
                    })
                }
                datesList[year][month].push({
                    date : CalendarUtils.getDateYYMMDD(tempDate),
                    dateNumber : dateNumber,
                    real : true,
                    // weekNumber : weekNumber,
                    weekFormat : year+"-"+weekNumber,
                })
                
                datesList[year][month] = [...datesList[year][month] , ...dummyDates]

            }else if(isFirstDayOfMonth(tempDate) && !isSaturday(tempDate)){
                const dummydates = CalendarUtils.getDummyDatesBeforeFirstDayOFMnth(  cloneDeep(tempDate))
                datesList[year][month].push({
                    dateNumber : dateNumber,
                    real : false,
                    weekNumber : CalendarUtils.getWeekNumber(tempDate),
                    weekStartDate : CalendarUtils.getDateYYMMDD(tempDate),
                    weekFormat : year+"-"+weekNumber,
                    isWeekNumber : true
                })
                datesList[year][month] = [...datesList[year][month] , ...dummydates]
                datesList[year][month].push({
                    date : CalendarUtils.getDateYYMMDD(tempDate),
                    dateNumber : dateNumber,
                    real : true,
                    // weekNumber : weekNumber,
                    weekFormat : year+"-"+weekNumber,
                })
            }else{
                if(isSaturday(tempDate)){
                    datesList[year][month].push({
                        // day : day,
                        dateNumber : dateNumber,
                        real : false,
                        weekNumber : CalendarUtils.getWeekNumber(tempDate),
                        weekStartDate : CalendarUtils.getDateYYMMDD(tempDate),
                        isWeekNumber : true,
                        weekFormat : year+"-"+weekNumber,
                    })
                }
                datesList[year][month].push({
                    date : CalendarUtils.getDateYYMMDD(tempDate),
                    dateNumber : dateNumber,
                    real : true,
                    // weekNumber : weekNumber,
                    weekFormat : year+"-"+weekNumber,
                })
            }
            tempDate.setDate(tempDate.getDate()+1)
           }
           weekNumber = 0
           return datesList
       }

       static getWeekNumber(tempDate){
            if(tempDate.getDate() === 1 && tempDate.getMonth() === 1 ){
                weekNumber = 1
            }else if(isSaturday(tempDate)){
                weekNumber = weekNumber + 1
                if(weekNumber === 53 && tempDate.getDate() > 25 && tempDate.getMonth() === 0){
                    weekNumber = 1
                }   
            }
            return weekNumber
       }
        /*eslint-disable*/
}
