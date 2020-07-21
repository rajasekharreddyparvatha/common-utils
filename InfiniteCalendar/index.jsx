
import React from 'react';
import Button from "@material-ui/core/Button";
import Popover from '@material-ui/core/Popover';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types"
import lodash from "lodash"
import classnames from "classnames"
import {parse} from "date-fns"
import styles from "./style"
import CalendarUtils from "./Utils"
import {getRandomNumber, getDateYYMMDD} from "./../../../utils/index"
import cloneDeep from 'lodash/cloneDeep';
import {isFriday, isSaturday }  from "date-fns" 
/*eslint-disable*/
/*
  selectedStartDate : Selected start date can be either proper format or undefined , 
  selectedEndDate : Selected end date can be either proper format or undefined 
  selectedDate : Selected  date can be either proper format or undefined 
  disableDates : All dates can be proper format or empty  
  isRangeType : is it single selection or range selection.
  (minDate, maxDate) : minDate should be less than maxDates. either both or any one can be undefined.
*/
class InfiniteCalendar extends React.Component {

  constructor(props){
      super(props)
      let {selectedStartDate, selectedEndDate, selectedDate, isRangeType, 
            disableDates, minDate, maxDate, isWalmartWeekNumber, isWeekSelection, startWeek, endWeek} = this.props.config
      this.disableDates = disableDates || []
      if(!isRangeType){
        selectedStartDate = selectedDate,
        selectedEndDate = selectedDate
      }
      this.dateList = {}
      this.currentDate =  CalendarUtils.getDateYYMMDD()
      this.isFrstCurScrollViewDone = false
      if(isWeekSelection){
        this.weekConfig  = {
          isWeekSelection : isWeekSelection,
          startWeek,
          endWeek,
          minDate : CalendarUtils.isValidDate( ) ? CalendarUtils.getDateYYMMDD(parse(minDate))   : undefined,
          maxDate : CalendarUtils.isValidDate(maxDate) ? CalendarUtils.getDateYYMMDD(parse(maxDate))   : undefined ,
          isRangeType : true
        }
      }else {
        this.weekConfig  = {}
      }
      this.dateConfig = {
        selectedStartDate : (!isWalmartWeekNumber && selectedStartDate  &&  CalendarUtils.isValidDate(selectedStartDate))?  CalendarUtils.getDateYYMMDD(parse(selectedStartDate)) : undefined,
        selectedEndDate : (!isWalmartWeekNumber && selectedEndDate &&  CalendarUtils.isValidDate(selectedEndDate)) ? CalendarUtils.getDateYYMMDD(parse(selectedEndDate)) : undefined,
        minDate : CalendarUtils.isValidDate(minDate) ? CalendarUtils.getDateYYMMDD(parse(minDate))   : undefined,
        maxDate : CalendarUtils.isValidDate(maxDate) ? CalendarUtils.getDateYYMMDD(parse(maxDate))   : undefined ,
        isRangeType : isRangeType
      }
      this.state = {
        hasError:  InfiniteCalendar.isAnyErrorFound(this.props.config),
        stateChange  : false
      }
      this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sep", "Oct", "Nov", "Dec"]
      this.weekNames = [ "Sat", "Sun","Mon", "Tue","Wed", "Thu","Fri"]
  }
  static isNotValidStartEndSelectedWeekNbr(startWeek, endWeek){
      try {
        let [startYear, startWeekNbr] = startWeek.split("-")
        let [endYear, endWeekNbr] = endWeek.split("-")
        startYear = Number.parseInt(startYear)
        endYear = Number.parseInt(endYear)
        startWeekNbr = Number.parseInt(startWeekNbr)
        endWeekNbr = Number.parseInt(endWeekNbr)
        if(startYear === endYear && startWeekNbr <= endWeekNbr ){
          return false
        }else if(startYear < endYear){
            return false
        }else{
          return true
        }
      }catch(e){
        return true
      }
  }
  static isAnyErrorFound(config){
      let error = false;
      const {selectedStartDate, selectedEndDate, selectedDate, disableDates, minDate, maxDate, isWalmartWeekNumber,
        startWeek, endWeek, isWeekSelection} = config
      if(!isWalmartWeekNumber && selectedStartDate && !CalendarUtils.isValidDate(selectedStartDate)){
          console.error("Selected start date is invalid ")
          error = true
      }
      if(!isWalmartWeekNumber && selectedEndDate && !CalendarUtils.isValidDate(selectedEndDate)){
          console.error("Selected end date is invalid ")
          error = true
      }
      if(!isWalmartWeekNumber && selectedDate && !CalendarUtils.isValidDate(selectedDate)){
          console.error("Selected date is invalid ")
          error = true
      }
      if(minDate && !CalendarUtils.isValidDate(minDate)){
          console.error("minDate is invalid ")
          error = true
      }
      if(maxDate && !CalendarUtils.isValidDate(maxDate)){
          console.error("maxDate is invalid ")
          error = true
      }
      if(minDate && maxDate && parse(minDate).getTime() >  parse(maxDate).getTime()){
          console.error("minDate should be less than maxDate ")
          error = true
      }
      if(disableDates && disableDates.length > 0 && !disableDates.every(dat => CalendarUtils.isValidDate(dat))){
        console.error("One of disable date is invalid ")
        error = true
      }
      if(isWeekSelection && InfiniteCalendar.isNotValidStartEndSelectedWeekNbr(startWeek, endWeek)){
        console.error("Start and End weeks are invalid, please use valid format")
        error = true
      }
      return error
  }
  static isAnyDateInvalid(config){
    const {selectedStartDate, selectedEndDate} = config
    return !((!selectedStartDate && !selectedEndDate) ||  (CalendarUtils.isValidDate(selectedStartDate) && 
                        CalendarUtils.isValidDate(selectedEndDate)))
  } 

  getWeekNamesDiv(){
    const {classes} = this.props
    return(<div className={classes.weeNamesCont}>
      <div className={classes.wkNumberLabel}>
        {"Wk"}
      </div>
      {this.weekNames.map(name => <div key={getRandomNumber()}  
      className={classes.weekNameLabel}>{name}</div>)}
    </div>)
  }
  changeColorOnClick(dateConfig){
      let {selectedStartDate, selectedEndDate} = dateConfig
      if(selectedStartDate){
        const  element = document.getElementById(selectedStartDate);
        if(element){
          element.style.borderRadius = "29px 0px 0px 29px",
          element.style.backgroundColor = "#bfdaf3"
        }
      }
      if(selectedEndDate){
        const  element = document.getElementById(selectedEndDate);
        if(element){
          element.style.borderRadius = "0px 29px 29px 0px",
          element.style.backgroundColor = "#bfdaf3"
        }
      }
      if(selectedEndDate === selectedStartDate){
        const  element = document.getElementById(selectedEndDate);
        if(element){
          element.style.borderRadius = "29px 29px 29px 29px",
          element.style.backgroundColor = "#bfdaf3" 
        }
      }
      if(selectedEndDate && selectedStartDate){
        const btwDates = CalendarUtils.getBtwDates(selectedStartDate, selectedEndDate)
        btwDates.forEach(btDate =>{
          if(btDate === selectedEndDate || selectedStartDate === btDate){
            return
          }
          const  element = document.getElementById(btDate);
          if(element){
            element.style.borderRadius = "0px",
            element.style.backgroundColor ="#bfdaf3"
          }
        })
      }
  }
  removePrecolr(dateConfig){
      let {selectedStartDate, selectedEndDate} = dateConfig
      if(selectedEndDate && selectedStartDate){
        const btwDates = CalendarUtils.getBtwDates(selectedStartDate, selectedEndDate)
        btwDates.forEach(btDate =>{
          const  element = document.getElementById(btDate);
          if(element){
            element.style.borderRadius = "0px",
            element.style.backgroundColor ="white"
          }
          
        })
      } 
  }
  isSelecteConfigChanged(preConfig, config){
      if(lodash.isEqual(preConfig, config)){
        return false
      }else{
        return true
      }
  }
  handleSingleSelection(date){
    const {selectedStartDate : preSelected} = cloneDeep(this.dateConfig)
    this.dateConfig.selectedStartDate = date,
    this.dateConfig.selectedEndDate = date
    this.setState(state =>({
      ...state,
      stateChange : !state.stateChange
    }), () =>{
      if(preSelected && preSelected !== date){
        const  element = document.getElementById(preSelected);
        if(element){
          element.style.borderRadius = "0px"
          element.style.backgroundColor ="white"
        }
      }
      const  element = document.getElementById(date);
      if(element){
        element.style.borderRadius = "29px"
        element.style.backgroundColor ="#bfdaf3"
      }
      this.markCurrentDate(true)
    })    
  }
  unSelecteWeeks(weekFormat){
      const  elements = document.querySelectorAll('[weekFormat="'+weekFormat+'"]');
      elements.forEach(ele => {
        if(isSaturday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
          ele.style = {}
        }else if(isFriday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
          ele.style ={}
        }else if(ele.getAttribute("isWeekNumber")){
          ele.children[0].style = {}
        }else {
          ele.style = {}
        }
      })
  }
  enableSelectedWeeks(weekFormat){
    const  elements = document.querySelectorAll('[weekFormat="'+weekFormat+'"]');
    elements.forEach(ele => {
      if(isSaturday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
        ele.style.borderRadius = "29px 0px 0px 29px",
        ele.style.backgroundColor = "#bfdaf3"
      }else if(isFriday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
        ele.style.borderRadius = "0px 29px 29px 0px",
        ele.style.backgroundColor = "#bfdaf3"
      }else if(ele.getAttribute("isWeekNumber")){
        ele.children[0].style.backgroundColor= "#006cce"
        ele.children[0].style.borderRadius = "29px 29px 29px 29px"
        ele.children[0].style.width = "70px"
        ele.children[0].style.color = "white"
        ele.children[0].style.height = "36px"
        ele.children[0].style.justifyContent =  "center"
        ele.children[0].style.display = "flex"
        ele.children[0].style.alignItems = "center"
      }else {
        ele.style.borderRadius = "0px 0px 0px 0px",
        ele.style.backgroundColor = "#bfdaf3"
      }
      
    })
  }
  isSelectedWeekGreater(week1 = "", week2 = ""){
      const startWkEle = document.getElementById(week1)
      const endWkEle = document.getElementById(week2)
      let startWkStartDate = undefined
      let endWkStartDate = undefined
      if(startWkEle){
        startWkStartDate = startWkEle.getAttribute("weekStartDate")
      }
      if(endWkEle){
        endWkStartDate = endWkEle.getAttribute("weekStartDate")
      }
      return (startWkStartDate && 
              endWkStartDate ) ?  parse(startWkStartDate).getTime() >= parse(endWkStartDate).getTime() : false
  }
  setWeekSelection(dateObj){
    const {isWeekSelection} = this.weekConfig
    if(!isWeekSelection){
      return
    }
    const { preconfig } = cloneDeep(this.weekConfig)
    let {startWeek, endWeek} = this.weekConfig
    if(!startWeek ){
      startWeek = dateObj.weekFormat
    }else if(!endWeek){
        if(this.isSelectedWeekGreater(startWeek, dateObj.weekFormat)){
          endWeek = startWeek
          startWeek = dateObj.weekFormat
        }else{
          endWeek = dateObj.weekFormat
        }
    }else {
      startWeek = dateObj.weekFormat
      endWeek = undefined
    }
    this.weekConfig = {
        ...this.weekConfig,
        startWeek,
        endWeek
    }
    if(this.isSelecteConfigChanged(preconfig, this.weekConfig)){
      this.setState(state =>({
        ...state,
        stateChange : !state.stateChange
      }), ()=>{
        this.selectWeeksByDate(this.getWeekStartDate(startWeek), this.getWeekStartDate(endWeek || startWeek))
      })
    }
  }
  getWeekStartDate(weekID){
    const currentMoveEle = document.getElementById(weekID);
    if(currentMoveEle){
        return parse(currentMoveEle.getAttribute("weekStartDate"))
    }else{
      return undefined
    }
  }
  mouseOutOnWeekNbr(){
    const {isWeekSelection, startWeek, endWeek, lastMouseMoveWeek} = this.weekConfig

    if(!isWeekSelection){
      return
    }
    let selStartWeekdate = this.getWeekStartDate(startWeek)
    let selEndWeekdate = this.getWeekStartDate(endWeek)
    let lastMouseMoveWeekDate = this.getWeekStartDate(lastMouseMoveWeek)
    if(!selStartWeekdate ||  (selStartWeekdate && selEndWeekdate) || !lastMouseMoveWeekDate){
      return
    }
    if(selStartWeekdate.getTime() < lastMouseMoveWeekDate.getTime()){
      this.unSelectWeeksByDates(parse(selStartWeekdate.setDate(selStartWeekdate.getDate() + 7)), lastMouseMoveWeekDate)
    }else if(selStartWeekdate.getTime() > lastMouseMoveWeekDate.getTime()){
      this.unSelectWeeksByDates(lastMouseMoveWeekDate, parse(selStartWeekdate.setDate(selStartWeekdate.getDate() - 7)))
    }
    this.weekConfig.lastMouseMoveWeek = undefined
  }
  isWeekBtSelectedWeeks(weekFormat){
    const { startWeek, endWeek} = this.weekConfig
    let currentMoveDate = this.getWeekStartDate(weekFormat)
    if(startWeek && endWeek){
      let selStartWeekdate = this.getWeekStartDate(startWeek)
      let selEndWeekdate = this.getWeekStartDate(endWeek)
      return currentMoveDate.getTime() >= selStartWeekdate.getTime() && currentMoveDate.getTime() <= selEndWeekdate.getTime()  
    }else{
      return startWeek == weekFormat 
    }
  }
  showStyleHoverOutOnWkNbr({weekFormat}){
    if(this.isWeekBtSelectedWeeks(weekFormat)){
      return 
    }
    const  elements = document.querySelectorAll('[weekFormat="'+weekFormat+'"]');
    elements.forEach(ele => {
      if(isSaturday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
        ele.style = {}
      }else if(isFriday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
        ele.style = {}
      }else if(ele.getAttribute("isWeekNumber")){
        ele.children[0].style = {}
      }else {
        ele.style = {}
      }
    })
  }
  showStylesHoverOnWeeksNbr(weekFormat){
    const  elements = document.querySelectorAll('[weekFormat="'+weekFormat+'"]');
    elements.forEach(ele => {
      if(isSaturday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
        ele.style.borderRadius = "29px 0px 0px 29px",
        ele.style.backgroundColor = "rgba(0, 0, 0, 0.08)"
      }else if(isFriday(parse(ele.id)) && (ele.getAttribute("isWeekNumber") === null)){
        ele.style.borderRadius = "0px 29px 29px 0px",
        ele.style.backgroundColor = "rgba(0, 0, 0, 0.08)"
      }else if(ele.getAttribute("isWeekNumber")){
        ele.children[0].style.backgroundColor= "rgba(0, 0, 0, 0.08)"
        ele.children[0].style.borderRadius = "29px 29px 29px 29px"
        ele.children[0].style.width = "70px"
        ele.children[0].style.height = "36px"
        ele.children[0].style.justifyContent =  "center"
        ele.children[0].style.display = "flex"
        ele.children[0].style.alignItems = "center"
      }else {
        ele.style.borderRadius = "0px 0px 0px 0px",
        ele.style.backgroundColor = "rgba(0, 0, 0, 0.08)"
      }
      
    })
  }
  mouseMoveOnWeekNbr(dateObj){
    const {isWeekSelection, startWeek, endWeek, lastMouseMoveWeek} = this.weekConfig
    const { weekFormat  : currentweekFormat } = dateObj

    if(!isWeekSelection){
      return
    }
    if(currentweekFormat && !this.isWeekBtSelectedWeeks(currentweekFormat)){
      this.showStylesHoverOnWeeksNbr(currentweekFormat)
    }
    let currentMoveDate = this.getWeekStartDate(currentweekFormat)
    let selStartWeekdate = this.getWeekStartDate(startWeek)
    let selEndWeekdate = this.getWeekStartDate(endWeek)
    let lastMouseMoveWeekDate = this.getWeekStartDate(lastMouseMoveWeek)
    
    if(!selStartWeekdate || (selStartWeekdate && selEndWeekdate)){
      return
    }
    if(currentMoveDate.getTime() === selStartWeekdate.getTime() && lastMouseMoveWeekDate){
          if(currentMoveDate.getTime() < lastMouseMoveWeekDate.getTime()){
            this.unSelectWeeksByDates(parse(currentMoveDate.setDate(currentMoveDate.getDate() + 7)), lastMouseMoveWeekDate)
          }else{
            this.unSelectWeeksByDates(lastMouseMoveWeekDate, parse(currentMoveDate.setDate(currentMoveDate.getDate() - 7)))
          }
    }else if(currentMoveDate.getTime() > selStartWeekdate.getTime()){
      if(!lastMouseMoveWeekDate || currentMoveDate.getTime() >= lastMouseMoveWeekDate.getTime()){
        this.selectWeeksByDate(selStartWeekdate, currentMoveDate)
      }else {
        this.unSelectWeeksByDates(parse(currentMoveDate.setDate(currentMoveDate.getDate() + 7)), lastMouseMoveWeekDate)
      }
    } else {
       if(!lastMouseMoveWeekDate || currentMoveDate.getTime() <= lastMouseMoveWeekDate.getTime()){
          this.selectWeeksByDate(currentMoveDate, selStartWeekdate)
       } else {
        this.unSelectWeeksByDates(lastMouseMoveWeekDate, parse(currentMoveDate.setDate(currentMoveDate.getDate() - 7)))
       }
    }
    this.weekConfig.lastMouseMoveWeek = currentweekFormat
  }

  selectWeeksByWeekNbr(){
    const { startWeek, endWeek} = this.weekConfig
    let selStartWeekdate = this.getWeekStartDate(startWeek)
    let selEndWeekdate = this.getWeekStartDate(endWeek)
    if(selStartWeekdate && selEndWeekdate && selStartWeekdate.getTime() <= selEndWeekdate.getTime()){
      this.selectWeeksByDate(selStartWeekdate, selEndWeekdate)
    }
  }  
  selectWeeksByDate(date1, date2){
    while(date1.getTime() <= date2.getTime()){
      const temp = getDateYYMMDD(date1)
        const ele = document.getElementById(temp)
        if(ele){
          console.log(temp)
          this.enableSelectedWeeks( ele.getAttribute("weekformat"))
        }
        date1.setDate(date1.getDate() + 7)
    }
  }

  unSelectWeeksByDates(date1, date2){
    while(date1.getTime() <= date2.getTime()){
        const ele = document.getElementById(getDateYYMMDD(date1))
        if(ele){
          this.unSelecteWeeks( ele.getAttribute("weekformat"))
        }
        date1.setDate(date1.getDate() + 7)
    }
  }
  setSelectedDate(date){
    const {isRangeType} = this.dateConfig
    const { isWeekSelection } = this.weekConfig
    if(isWeekSelection){
      return 
    }
    if(!isRangeType){
      this.handleSingleSelection(date)
      return
    }
    const preDateConfig = cloneDeep(this.dateConfig)
    let {selectedStartDate, selectedEndDate} = this.dateConfig
    if(!selectedStartDate ){
      selectedStartDate = date
    }else if(!selectedEndDate){
        if(parse(selectedStartDate).getTime() > parse(date).getTime()){
          selectedEndDate = selectedStartDate
          selectedStartDate = date
        }else{
          selectedEndDate = date
        }
    }else {
        selectedStartDate = date
        selectedEndDate = undefined
    }
    
    this.dateConfig = {
        ...this.dateConfig,
        selectedStartDate,
        selectedEndDate
    }
    
    if(this.isSelecteConfigChanged(preDateConfig, this.dateConfig)){
      this.setState((state) =>({      ...state,
        stateChange : !state.stateChange}), () =>{
        this.removePrecolr(preDateConfig)
        this.markCurrentDate(true)
        this.removeColorOnDisabledates()
        this.changeColorOnClick(this.dateConfig)
      })
    }
  }

  markCurrentDate(isRequire){
      const {selectedStartDate, selectedEndDate , lastMoveDate} = this.dateConfig
    // if(this.currentDate === selectedStartDate || 
    //     this.currentDate === selectedEndDate || 
    //     this.currentDate === lastMoveDate || this.isDateInBtwDates(this.currentDate, selectedStartDate, selectedEndDate)){
    //   return
    // }
      const ele = document.getElementById(this.currentDate)
      if(ele){
        ele.style.display = "flex"
        ele.style.flexDirection= "column"
        ele.style.paddingTop  = "10px"
        if(ele.children.length > 0 ){
          return
        }
        const span = document.createElement("span"); 
        ele.appendChild(span)    
        span.innerText = "Today"
        span.style.fontSize = "10px"
        span.style.color= "rgb(0, 108, 206)"
        span.style.paddingTop  = "1px" 
      }
  }
  addWhiteColorBtwDates(date1, date2){
    const btwDates = parse(date1).getTime() < parse(date2).getTime() ? 
    CalendarUtils.getBtwDates(date1, date2) : CalendarUtils.getBtwDates(date2, date1)
        btwDates.forEach(date =>{
          const  element = document.getElementById(date);
          if(element){
            element.style.borderRadius = "0px"
            element.style.backgroundColor ="white"
          }
        })
  }
  mouseMoveDate(dateObj){
    const {isRangeType} = this.dateConfig
    const { isWeekSelection } = this.weekConfig
    let {date} = dateObj
    if(isWeekSelection){
      this.mouseMoveOnWeekNbr(dateObj)
    }
    if(!isRangeType){
      return
    }
    const {selectedStartDate, selectedEndDate, lastMoveDate} = this.dateConfig
    if(selectedStartDate && parse(date).getTime() > parse(selectedStartDate).getTime()  && 
          selectedEndDate === undefined){
          this.addWhiteColorBtwDates(date, lastMoveDate)
        const btwDates = CalendarUtils.getBtwDates(selectedStartDate, date)
        btwDates.forEach(btDate =>{
          const  element = document.getElementById(btDate);
          if(element){
            if(selectedStartDate === btDate){
              element.style.borderRadius = "29px 0px  0px  29px"
            }else  if(btDate === date){
              element.style.borderRadius = "0px 29px 29px 0px"
            }else{
              element.style.borderRadius = "0px"
            }
            element.style.backgroundColor ="#bfdaf3"
          }
        })
        this.markCurrentDate(!this.isDateInBtwDates(this.currentDate, selectedStartDate, date))
        this.removeColorOnDisabledates()
    } else if(selectedStartDate && parse(date).getTime() <= parse(selectedStartDate).getTime()  && 
                  selectedEndDate === undefined) {
          this.addWhiteColorBtwDates(date, lastMoveDate)
        if(selectedStartDate === date){
          const  element = document.getElementById(selectedStartDate);
          if(element){
            element.style.borderRadius = "29px"
            element.style.backgroundColor ="#bfdaf3"
          } 
        }else{
          const btwDates = CalendarUtils.getBtwDates(date, selectedStartDate)
          btwDates.forEach(btDate =>{
            const  element = document.getElementById(btDate);
            if(element){
              if(selectedStartDate === btDate){
                element.style.borderRadius = "0px 29px 29px 0px"
              }else if(btDate === date){
                element.style.borderRadius = "29px 0px  0px  29px"
              }else{
                element.style.borderRadius = "0px"
              }
              element.style.backgroundColor ="#bfdaf3"
            }
            
          })
        }
        this.markCurrentDate(!this.isDateInBtwDates(this.currentDate, date, selectedStartDate))
        this.removeColorOnDisabledates()
    }
    this.dateConfig.lastMoveDate = date 
  }
  onMouseOut(){
    const {isRangeType} = this.dateConfig
    const { isWeekSelection } = this.weekConfig
    if(!isRangeType){
      return
    }
    if(isWeekSelection){
      this.mouseOutOnWeekNbr()
    }
    const {selectedStartDate, selectedEndDate, lastMoveDate} = this.dateConfig
    if(selectedStartDate && !selectedEndDate){
      this.addWhiteColorBtwDates(selectedStartDate, lastMoveDate)
      const  element = document.getElementById(selectedStartDate);
      if(element){
        element.style.borderRadius = "29px 0px  0px  29px"
        element.style.backgroundColor ="#bfdaf3"
      }
      
    }
  }
  componentDidMount(){
    const {isWalmartWeekNumber, startWeekNumber, endWeekNumber }= this.props.config
    this.dateConfig = {
      ...this.dateConfig,
      ...this.getMinMaxDatesInSelectedDateRange()
    }
    if(this.state.hasError){
      this.dateList = []
    }else{
      this.dateList = CalendarUtils.getDateForYear(this.dateConfig)
    }
    if(this.dateList && Object.entries(this.dateList).length > 0){
      if(isWalmartWeekNumber && startWeekNumber && endWeekNumber){
        let selectedStartDate = this.getDateByWeekNumber(Number.parseInt(startWeekNumber)%100 ,
                                                        "20"+(Number.parseInt((Number.parseInt(startWeekNumber)/100)%100)), true)
        let selectedEndDate = this.getDateByWeekNumber(Number.parseInt(endWeekNumber)%100 ,
                                                        "20"+(Number.parseInt((Number.parseInt(endWeekNumber)/100)%100)))
        if(selectedStartDate && selectedEndDate){
          this.dateConfig = {
            ...this.dateConfig,
            selectedStartDate,
            selectedEndDate
          }
        }
      }
      this.forceUpdate()
    }
  }
  renderColorForSelectedDates(obj){
    this.changeColorOnClick(obj)
  }
  getDateByWeekNumber(weekNumber, year, isStart){
    let date = undefined
    Object.entries(this.dateList[year]).some(([key, month]) => {
      let index = month.findIndex(obj => isStart ? obj.weekNumber === weekNumber : (obj.weekNumber) === weekNumber + 1 )
      if(index >= 0 && isStart){
        let poisOfDate = month.findIndex((obj, position) => obj.real && position >= index)
        date = poisOfDate > 0 ? month[poisOfDate].date : undefined
        return true
      }else if(index >= 0 && !isStart){
        let dateNotFound = true
        let startIndex = index
        while(dateNotFound){
          startIndex = startIndex - 1
           let tempDate = month[startIndex]
           if(tempDate.real){
            dateNotFound = false
            date = tempDate.date
            return true
           }
           if(startIndex === 0){
             return
           }
        }
      }
    })
    return date
  }
  
  getMinMaxDatesInSelectedDateRange(){
    const {selectedStartDate, selectedEndDate, maxDate, minDate} = this.dateConfig
    return {
      calendarStartDate : ((!selectedStartDate && CalendarUtils.isValidDate(minDate)) || parse(minDate).getTime() <= parse(selectedStartDate).getTime()  ) ? minDate :  selectedStartDate ,
      calendarEndDate : ((!selectedEndDate && CalendarUtils.isValidDate(maxDate)) ||  parse(maxDate).getTime() >= parse(selectedEndDate).getTime() ) ? maxDate : selectedEndDate,
    }
  }
  componentDidUpdate(){
    const {selectedStartDate} = this.dateConfig
    const { isWeekSelection , startWeek} = this.weekConfig
    const divId = isWeekSelection ? getDateYYMMDD(this.getWeekStartDate(startWeek)) : ( selectedStartDate || this.currentDate)
    const ele = document.getElementById("month-" + parse(divId).getFullYear()+"-"+parse(divId).getMonth())
    if(ele && !this.isFrstCurScrollViewDone){
      ele.scrollIntoView()
      this.isFrstCurScrollViewDone = true
      this.markCurrentDate(true)
      this.removeColorOnDisabledates()
      if(isWeekSelection){
        this.selectWeeksByWeekNbr()
      }else{
        this.renderColorForSelectedDates(this.dateConfig)
      }
    }
  }
  removeColorOnDisabledates(){
    this.disableDates.forEach(disDates => {
      const  element = document.getElementById(disDates);
      if(element){
        // element.style.borderRadius = "0px"
        element.style.borderBottom ="solid 1px white"
      }
    })    
  }
  isDateInBtwDates(date, startDate, endDate){
    return parse(date).getTime() >= parse(startDate).getTime() && 
    parse(date).getTime() <= parse(endDate).getTime()
  }
  getDiableDates(){
    const {config : {disableDates = []}} = this.props
    return disableDates.map(date => CalendarUtils.getDateYYMMDD(parse(date)))
  }
  isDateInMinMaxRange(date){
    const {maxDate, minDate} = this.dateConfig
    if(!maxDate && !minDate){
      return true
    }else if(maxDate && minDate){
        return this.isDateInBtwDates(date, minDate, maxDate)
    }else if(minDate){
      return parse(date).getTime() >= parse(minDate).getTime() 
    }else if(maxDate){
      return parse(date).getTime() <= parse(maxDate).getTime() 
    }
  }
 
  isWeekActionRequire(dateObj){
    const { isWeekSelection } = this.weekConfig
    return isWeekSelection && this.isDateInMinMaxRange(dateObj.weekStartDate)
  }
  getValue(dateObj){
      const {classes} = this.props
      const { isWeekSelection } = this.weekConfig
      if(dateObj.isWeekNumber){
          return(<div key={getRandomNumber()} 
                      id = {dateObj.weekFormat}
                      weekFormat={dateObj.weekFormat}
                      isWeekNumber={"true"}
                      weekStartDate = {dateObj.weekStartDate}
                      onClick={() => this.isWeekActionRequire(dateObj) ? this.setWeekSelection(dateObj) : ""}
                      onMouseOut={() => this.isWeekActionRequire(dateObj) ? this.showStyleHoverOutOnWkNbr(dateObj) : ""}
                      onMouseMove={() => this.isWeekActionRequire(dateObj) ? this.mouseMoveOnWeekNbr(dateObj) : ""}
                      style={{cursor: this.isWeekActionRequire(dateObj) ? "pointer": "default"}}
                      className={classes.wkSelection}>
                      <div>
                          {"Wk "+dateObj.weekNumber}
                      </div>
            </div>)
      }else if(dateObj.real && !this.disableDates.includes(dateObj.date) && 
              this.isDateInMinMaxRange(dateObj.date)){
        return(<div  id={dateObj.date} key={getRandomNumber()}
                  weekFormat={dateObj.weekFormat}
                  onMouseOut={() => isWeekSelection ? this.showStyleHoverOutOnWkNbr(dateObj) : ""}
                  onClick={() => isWeekSelection ? this.setWeekSelection(dateObj) : this.setSelectedDate(dateObj.date)}
                  onMouseMove={() =>isWeekSelection ? this.mouseMoveOnWeekNbr(dateObj) : this.mouseMoveDate(dateObj)}
                  className={classnames(isWeekSelection ? classes.dateNumberInacive :  classes.dateNumber)}
                  >
                {dateObj.dateNumber}
          </div>)
      }else if(!dateObj.real ||  this.disableDates.includes(dateObj.date) ||
               !this.isDateInMinMaxRange(dateObj.date)){
        return(<div key={getRandomNumber()} id={dateObj.date} weekFormat={dateObj.weekFormat}
         className={classes.disableDateNumber}>
                  {dateObj.dateNumber}
          </div>)
      }
    
  }
  getMonthDiv(year, month){
    const {classes} = this.props
    return(<div key={getRandomNumber()}  id={"month-" + year+"-"+month} className={classes.monthCont}>
          <div style={{backgroundColor: "#eff6fc", marginRight:"5px"}}/>
          <div className={classes.monthLabel}> 
          {this.months[month]+" "+year}
          </div>
    </div>)
  }
  
  getHigherDates(){
    const {maxDate} = this.dateConfig
    let [year] = Object.entries(this.dateList)[Object.entries(this.dateList).length-1]
    let scrollDate  = year+"-01-31"
    let lastDate = parse(year+"-01-31") 
    if(maxDate && lastDate.getTime() >= parse(maxDate).getTime()){
      return
    }else{
      lastDate.setFullYear(lastDate.getFullYear() - 1)
      let calendarStartDate = cloneDeep(lastDate)
      lastDate.setFullYear(lastDate.getFullYear() + 1)
      let calendarEndDate = cloneDeep(lastDate)
      this.dateList =  CalendarUtils.getDateForYear({calendarStartDate, calendarEndDate})
      this.setState(state =>({
        ...state,
        stateChange : !state.stateChange
      }), ()=>{
        this.markCurrentDate(true)
        this.removeColorOnDisabledates()
        this.renderColorForSelectedDates(this.dateConfig)
        const ele = document.getElementById(scrollDate)
        if(ele){
          ele.scrollIntoView()
        }
      })
    }
  }
  getLowerDates(){
    const {minDate} = this.dateConfig
    let [year] = Object.entries(this.dateList)[0]
    let scrollDate  = year+"-02-01"
    let firstDate = parse(year+"-02-01") 
    let lastDate = parse(year+"-02-01") 
    if(minDate && firstDate.getTime() <= parse(minDate).getTime()){
      return
    }else{
      firstDate.setFullYear(firstDate.getFullYear() - 1)
      let calendarStartDate = cloneDeep(firstDate)
      lastDate.setFullYear(lastDate.getFullYear() + 1)
      let calendarEndDate = cloneDeep(lastDate)
      this.dateList = CalendarUtils.getDateForYear({calendarStartDate, calendarEndDate})
      this.setState(state =>({
        ...state,
        stateChange : !state.stateChange
      }), ()=>{
        this.markCurrentDate(true)
        this.removeColorOnDisabledates()
        this.renderColorForSelectedDates(this.dateConfig)
        const ele = document.getElementById(scrollDate)
        if(ele){
          ele.scrollIntoView()
        }
      })
    }

  }
  onScroll(e){
    if(e.target.scrollTop === 0){  
          this.getLowerDates()
    }else if((e.target.offsetHeight + e.target.scrollTop) === e.target.scrollHeight){
          this.getHigherDates()
    }
}
  getScrollDates(){
    const {classes} = this.props
    this.disableDates = this.getDiableDates()

    return (<div className={classes.scrollDatesCont} onScroll={(e) =>this.onScroll(e)} onMouseOut={() => this.onMouseOut()}>
              {Object.entries(this.dateList).map(([year, months])=>
                 Object.entries(months).map(([month, dates])=><React.Fragment key={getRandomNumber()} >
                  {this.getMonthDiv(year, month)}
                  <div className={classes.listMonthDates} 
                      style={{gridTemplateRows: " 46px ".repeat(dates.length/8)}}>
                    {dates.map(dateObj => this.getValue(dateObj))}
                  </div>
                </React.Fragment>
                )
              )}
          </div>)
  }
  getShowDateLabel(date){
    return this.months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()
  }
  getWeekNbrLabel(selWeek){
    return "Wk-"+selWeek.split("-")[1]+", "+selWeek.split("-")[0]
  }
  getHeader(){
    const {classes} = this.props
    const {selectedStartDate, selectedEndDate} = this.dateConfig
    const {isWeekSelection, startWeek, endWeek} = this.weekConfig
    return (<div className={classes.headerCont}>
            <div className={classes.customDateLabel}>
                  {isWeekSelection ? "Selected Week ": "Custom Date"}
            </div>
            <div className={classes.showDateLabel}>
                  <div className={classes.showDate}>
                      {!isWeekSelection && selectedStartDate ? this.getShowDateLabel(parse(selectedStartDate)):""}
                      {isWeekSelection && startWeek ? this.getWeekNbrLabel(startWeek):""}
                  </div>
                  <div className={classes.showDateSeperator}>
                    {" - "}
                  </div>
                  <div className={classes.showDate}>
                    {!isWeekSelection && selectedEndDate ? this.getShowDateLabel(parse(selectedEndDate)):""}
                    {isWeekSelection && endWeek ? this.getWeekNbrLabel(endWeek):""}
                  </div>
            </div>
    </div>)
  }
  getCalendar(){
    const {classes} = this.props
    const {isRangeType} = this.dateConfig
    if(this.state.hasError){
        return(
          <div className={classes.errorPopUPCont} 
          style={{gridTemplateRows: isRangeType ?  "80px 40px auto 56px" :  "40px 264px 56px"}}>
          {isRangeType &&  this.getHeader()}
          {this.getWeekNamesDiv()}
          {<div className={classnames(classes.popUPCont, classes.errorcheck)} >
                          {"May be Date format is invalid, Please check console log for moreinfo."}
                  </div>}
          {this.getFooter()}
          </div>)

    }
    return (<div className={classes.popUPCont} 
              style={{gridTemplateRows: isRangeType ?  "80px 40px auto 56px" :  "40px auto 56px"}}>
          {isRangeType &&  this.getHeader()}
          {this.getWeekNamesDiv()}
          {this.getScrollDates()}
          {this.getFooter()}
      </div>)
  }
  
  applyDate() {
    const {selectedStartDate, selectedEndDate, isRangeType} = this.dateConfig
    const { startWeek, endWeek, isWeekSelection} = this.weekConfig
    if(isWeekSelection){
      this.props.onDateSelect({
        start : {
          startWeek,
          startWeekStartDate : this.getWeekStartDate(startWeek)
        },
        end :{
          endWeek,
          endWeekStartDate :  this.getWeekStartDate(endWeek)
        }
      })
    }else if(selectedStartDate && selectedEndDate){
      if(isRangeType){
        this.props.onDateSelect({
          start :selectedStartDate,
          end :  selectedEndDate
        })
      }else{
        this.props.onDateSelect({
          selectedDate :selectedStartDate,
        })
      }
    }
  }

  isApplyEnable(){
    const {selectedStartDate, selectedEndDate} = this.dateConfig
    const { startWeek, endWeek} = this.weekConfig
    if((selectedStartDate && selectedEndDate) || (startWeek && endWeek)){
      return true
    }else{
      return false
    }
  }
  closeWidget(){
    this.props.handleClose()
  }
  getFooter(){
    const {classes} = this.props
    return(<div className={classes.footerCont}>
                <Button id={"applyDate"} classes={{root : classnames(classes.footerBtnApply, 
                    this.isApplyEnable()?"":  classes.cursorApply) }}  
                    onClick={() => this.applyDate()}> {"APPLY"} </Button>
                <Button id={"closeDateWidget"} classes={{root : classes.footerBtnCancel}}  
                    onClick={() => this.closeWidget()}> {"CLOSE"} </Button>
    </div>)
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }
  render(){
    const {config} = this.props
      /* {
        eTarget : e.currentTarget,
        isRangeType : true,
        selectedStartDate : undefined,
        selectedEndDate : undefined,
        selectedDate : undefined,
        minDate : minDate,
        maxDate : maxDate,
        disableDates : [],
      }*/
      return (
        <Popover
        open={true}
        anchorEl={config.eTarget}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => {}}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {this.getCalendar()}
      </Popover>
      
      )
  }
  
}

InfiniteCalendar.propTypes = {
  config :  PropTypes.object,
  handleClose:  PropTypes.func,
  onDateSelect:  PropTypes.func
}

export default withStyles(styles)(InfiniteCalendar);