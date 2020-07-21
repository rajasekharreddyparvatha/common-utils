import React, {  Component } from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import {getRandomNumber} from "./../../../../utils/index"
import {
  withGoogleMap,
  GoogleMap,
  withScriptjs,
  Circle,
  Marker,
  InfoWindow
} from "react-google-maps";

const zoomLevelForCircle = {
  "22" : 1,
  21 : 1,
  20 : 1,
  "19" : 2,
  18 : 7,
  "17" : 15,
  16 : 25,
  "15" : 37,
  "14" : 100,
  "13" : 130,
  "12" : 300,
  "11" : 500,
  "10" : 1000,
  "9" : 2500,
  "8" : 5000,
  "7" : 9000,
  '6' : 17000,
  "5" : 35000,
  "4" : 45000,
  "3" : 65000,
  "2": 95000,
  "1" : 120000
}
class WMMap extends Component {
  constructor(props) {
    super(props);
    this.mapInstance = React.createRef();
    this.state = {
      hoveredDC : undefined,
      zoomLevel : this.props.zoom,
      circleRadius : 45000
     }
  };

   renderCircles(){
    const {dcGeochart, isMouseOverRequire} = this.props
    return (dcGeochart.map(obj => <Circle key={getRandomNumber()}
      radius={this.state.circleRadius}
      options={{
                fillColor: (obj.actual > 7 || obj.predicted > 7)?"#E02727" : "#FFC220",
                fillOpacity: 1,
                strokeOpacity: 0,
                strokeColor: '#4B0082'
              }}
      defaultCenter={{
        lat: parseFloat(obj.latitude),
        lng: parseFloat(obj.longitude)
      }}
      onClick={() => this.props.clickOnCircle(obj)}
      onMouseOver={() => isMouseOverRequire ? this.onMouseOver(obj) : ""}
      onMouseOut={() => isMouseOverRequire ? this.onMouseOut() : ""}
    />))
   }
   onMouseOver(obj){
    this.setState(state => ({
      ...state,
      hoveredDC : obj
    }))
   }
   onMouseOut(){
    // this.setState(state => ({
    //   ...state,
    //   hoveredDC : undefined
    // }))
   }
   onZoomChanged(){
     const curZoomVal = this.mapInstance.current.getZoom()
       this.setState(state =>({
         ...state,
         circleRadius : zoomLevelForCircle[curZoomVal],
       }))
   }
  render() {
        const {isMarkerShown, markerLatitude, markerLongitude, center, zoom} = this.props
        const {hoveredDC} = this.state
        return (<div>
            <GoogleMap 
            ref={this.mapInstance}
                      defaultZoom={zoom} 
                      defaultCenter={center}
                      defaultOptions={{
                        streetViewControl: false,
                        fullscreenControl: false,
                        mapTypeControl: true,
                        zoomControl: true,
                        scrollwheel: true
                      }}
                      onZoomChanged={() => this.onZoomChanged()}
                      >
            {isMarkerShown && 
              <Marker position={{ lat: markerLatitude, lng: markerLongitude }} /> 
            }
            {this.renderCircles()}
          </GoogleMap>
          {hoveredDC ?
            <InfoWindow
              visible={true}
              position={{ lat: parseFloat(this.state.hoveredDC.latitude), 
                          lng: parseFloat(this.state.hoveredDC.longitude) }}>
              {this.props.showInfoOnMouseOver()}
            </InfoWindow>
            : null}
        </div>)
  }
}
WMMap.propTypes = {
  zoom : PropTypes.string,
  dcGeochart : PropTypes.object,
  isMouseOverRequire : PropTypes.bool,
  clickOnCircle : PropTypes.func,
  markerLatitude :   PropTypes.string,
  markerLongitude : PropTypes.string,
  center : PropTypes.string,
  showInfoOnMouseOver : PropTypes.func,
  isMarkerShown : PropTypes.bool,
}
export default withStyles({})(withScriptjs(withGoogleMap(WMMap)));

// export default withScriptjs(withGoogleMap(WMMap));