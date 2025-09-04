import PropTypes from 'prop-types';
//import React, { useState } from 'react';
//import React, { useRef, useState, useEffect } from 'react';
import React from 'react';
//import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { withLeaflet } from 'react-leaflet/es/context'; // New for Leaflet access.
import Popup from 'react-leaflet/es/Popup';

/*
  in map.scss:
  .single-popup {
    .leaflet-popup-content {
      width: 320px;
    }
  }
  pid = 'xtp_0', 'xtp_1', etc.
*/
//export default function XtpPopup({ pid, lat, lon, xtpurl }) {

// See similar example at function SelectStopRow  !!!!!

class XtpPopup extends React.Component {
  
  static displayName = 'XtpPopup';

  static propTypes = {
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        //openPopup: PropTypes.func.isRequired,
        //closePopup: PropTypes.func.isRequired,
        getZoom: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    pid: PropTypes.string.isRequired,
    xtp_last_index: PropTypes.number.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    xtpurl: PropTypes.string.isRequired,
    openPopup: PropTypes.func.isRequired,
    closePopup: PropTypes.func.isRequired,
    autoOpen: PropTypes.bool.isRequired,
    windowSize: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
      outer: {
        width: PropTypes.number,
        height: PropTypes.number,
      },
    }),
  };
  
  static defaultProps = {
    windowSize: {width:300,height:400,outer:{width:300,height:400}},
  };
  
  constructor(props) {
    console.log(['constructor props=',props]);
    super(props);
    this.state = {
      clicked: false, // toggles false / true
      autoOpenEnabled: true,
      zoom: this.props.leaflet.map.getZoom(),
    };
    this.fullScreen = false;
    this.dimensions = {picW:300, picH:400, popupW:300, popupH:400};
    this.autoClose = false;
    
  }
  
  setDefaultDimensions = () => {
    this.dimensions.picW = 300;
    this.dimensions.picH = 400;
    this.dimensions.popupW = 300;
    this.dimensions.popupH = 400;
  }
  
  setZoomedDimensions = () => {
    this.dimensions.picW = 600;
    this.dimensions.picH = 800;
    this.dimensions.popupW = 600;
    this.dimensions.popupH = 800;
  }
  
  onMapZoom = () => {
    // Toggle the state to re-render component
    const zoom = this.props.leaflet.map.getZoom();
    console.log(['onMapZoom zoom=',zoom]);
    this.setState({zoom:zoom});
  }
  
  /*
  this.props.pid is the "key" to the Marker behind this Popup.
  */
  /*
  getMapLayers = () => {
    //const pid = this.props.pid;
    const markers = [];
    this.props.leaflet.map.eachLayer(function (layer) {
      //console.log(['layer=',layer]);
      if (layer instanceof L.Marker){
        //console.log(['MARKER layer=',layer]);
        if (layer.options && layer.options.className) {
          // className: "xtp xtp_0"
          const classes = layer.options.className.split(" ");
          classes.forEach(c=>{
            const index = c.indexOf('xtp_');
            if (index === 0) {
              markers.push(c); // xtp_0, xtp_1, ... , xtp_n-1
            }
          });
        }
      }
    });
    console.log(['markers=',markers]);
    return markers;
  }*/

  componentDidUpdate(prevProps, prevState) {
    console.log(['componentDidUpdate prevProps=',prevProps,'prevState=',prevState]);
    if (this.state.autoOpenEnabled===true && this.props.autoOpen===true) {
      console.log(['componentDidUpdate autoOpen this.props.pid=',this.props.pid]);
      this.props.openPopup(this.props.pid);
    }
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  }
  
  //Can we size the "zoomed" picture to half height (bottom half) and whole width of element "div.leaflet-container"?
  getMapDimensions = () => {
    const dim = {w:0,h:0};
    const elems = document.querySelectorAll('div.leaflet-container');
    [...elems].forEach(e=>{
      dim.w = e.clientWidth;
      dim.h = e.clientHeight;
    });
    console.log(['GET MAP DIMENSIONS elems=',elems,'dim=',dim]);
    console.log(['this.props.windowSize=',this.props.windowSize]);
    return dim;
  }
  
  processStyles = () => {
    const elems = document.querySelectorAll('div.leaflet-popup-content');
    if (this.fullScreen) {
      console.log(['PROCESS STYLES FULLSCREEN elems=',elems]);
    } else {
      console.log(['PROCESS STYLES NORMAL elems=',elems]);
    }
    [...elems].forEach(e=>{
      //e.setAttribute('style', 'width:610px; height:810px; padding:5px;');
      e.style.width = this.dimensions.popupW+"px";
      e.style.height = this.dimensions.popupH+"px";
      //e.style.padding = "5px";
    });
  }
  
  processPopupLeft = () => {
    const left = -Math.round(this.dimensions.popupW/2);
    const elems = document.querySelectorAll('div.single-popup');
    if (this.fullScreen) {
      console.log(['PROCESS Popup Left FULLSCREEN elems=',elems,'left=',left]);
    } else {
      console.log(['PROCESS Popup Left NORMAL elems=',elems,'left=',left]);
    }
    [...elems].forEach(e=>{
      e.style.left = left+"px";
    });
  }
  
  toggleStop = () => {
    this.setState(prevState => ({
      autoOpenEnabled: !prevState.autoOpenEnabled
    }));
  }
  
  handlePrev = () => {
    const c_index = parseInt(this.props.pid.slice(4));
    console.log(['HANDLE previous! c_index=',c_index]);
    if (c_index > 0) {
      const prev_index = c_index-1;
      const prev_id = 'xtp_'+prev_index;
      this.props.closePopup();
      setTimeout(() => {
        this.props.openPopup(prev_id);
      }, 400);
    }
  }
  
  handleNext = () => {
    const c_index = parseInt(this.props.pid.slice(4));
    console.log(['HANDLE next! c_index=',c_index,'last_index=',this.props.xtp_last_index]);
    if (c_index < this.props.xtp_last_index) {
      const next_index = c_index+1;
      const next_id = 'xtp_'+next_index;
      this.props.closePopup();
      setTimeout(() => {
        this.props.openPopup(next_id);
      }, 400);
    }
  }
  
  handleClick = () => {
    console.log('TOGGLE image!');
    if (this.fullScreen) { // back to small size
      this.fullScreen = false;
      this.setDefaultDimensions();
    } else { // make image fullscreen
      this.fullScreen = true;
      this.getMapDimensions(); // Test this!
      this.setZoomedDimensions();
    }
    // Toggle the state to re-render component
    this.setState(prevState => ({
      clicked: !prevState.clicked
    }));
    this.autoClose = true;
    this.props.closePopup();
    setTimeout(() => {
      this.props.openPopup(this.props.pid);
    }, 400);
  };
  
  render() {
    console.log(['Create Popup this.props.pid=',this.props.pid]);
    const c_index = parseInt(this.props.pid.slice(4));
    const prev_state = c_index !== 0 ? 'y' : ''; // "Previous"-button is disabled when prev_state is empty
    const next_state = c_index < this.props.xtp_last_index ? 'y' : ''; // "Next"-button is disabled when next_state is empty
    const stop_state = 'y';
    const title = this.state.autoOpenEnabled===true ? 'AUTO' : 'MANUAL';
    return (
      <Popup
        position={{ lat: this.props.lat+0.0001, lng: this.props.lon }}
        offset={[0, 0]}
        autoPanPaddingTopLeft={[5, 125]}
        onClose={() => {
          if (this.autoClose) {
            console.log('onClose AUTO CLOSE... do nothing.');
            this.autoClose = false;
          } else {
            console.log('onClose... RESET.');
            this.fullScreen = false;
            this.setDefaultDimensions();
            this.processStyles();
            this.processPopupLeft();
          }
        }}
        onOpen={() => {
          console.log('onOpen... process.');
          this.processStyles();
          this.processPopupLeft();
        }}
        maxWidth={this.dimensions.popupW}
        maxHeight={this.dimensions.popupH}
        autoPan={true}
        className="popup single-popup"
      >
        <Card className="no-margin">
          <div className="location-popup-wrapper">
            <div className="location-thumbnail-image">
              <img onClick={this.handleClick} src={this.props.xtpurl} width={this.dimensions.picW} height={this.dimensions.picH} />
            </div>
            <div className="xtp-map-popup-button-container">
              <div className="xtp-map-popup-button-wrapper"><button disabled={!prev_state} onClick={this.handlePrev}>Previous</button></div>
              <div className="xtp-map-popup-button-wrapper"><button disabled={!stop_state} onClick={this.toggleStop}>{title}</button></div>
              <div className="xtp-map-popup-button-wrapper"><button disabled={!next_state} onClick={this.handleNext}>Next</button></div>
            </div>
          </div>
        </Card>
      </Popup>
    );
  }
}

const XtpPopupWithLeaflet = withLeaflet(XtpPopup);

export {
  XtpPopupWithLeaflet as default,
  XtpPopup as Component,
};
