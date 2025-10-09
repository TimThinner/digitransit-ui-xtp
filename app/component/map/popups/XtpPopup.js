import PropTypes from 'prop-types';
//import React, { useState } from 'react';
//import React, { useRef, useState, useEffect } from 'react';
import React from 'react';
import { locationShape } from '../../../util/shapes';
import Card from '../../Card';
import Toggle from '../../Toggle';
import { withLeaflet } from 'react-leaflet/es/context'; // New for Leaflet access.
import Popup from 'react-leaflet/es/Popup';
/*
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
        closePopup: PropTypes.func.isRequired,
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
    handlePrev: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired,
    handleSetIndex: PropTypes.func.isRequired,
    toggleAuto: PropTypes.func.isRequired,
    autoOpen: PropTypes.bool.isRequired,
    locationState: locationShape.isRequired,
  };
  
  constructor(props) {
    console.log(['constructor props=',props]);
    super(props);
    this.state = {
      width: 0,
      height: 0,
      size: 'S',
      zoom: this.props.leaflet.map.getZoom(),
    };
  }
  
  getMapDimensions = () => {
    const dim = {w:0,h:0};
    const elems = document.querySelectorAll('div.leaflet-container');
    [...elems].forEach(e=>{
      dim.w = e.clientWidth;
      dim.h = e.clientHeight;
    });
    //console.log(['GET MAP DIMENSIONS elems=',elems,'dim.w=',dim.w,'dim.h=',dim.h]);
    return dim;
  }
  
  updateDimensions = () => {
    this.setState(prevState => ({
      ...prevState, // keep all other key-value pairs
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  }
  
  onMapZoom = () => {
    // Toggle the state to re-render component
    const zoom = this.props.leaflet.map.getZoom();
    this.setState(prevState => ({
      ...prevState, // keep all other key-value pairs
      zoom: zoom,   // update the value of specific key
    }));
  }
  /*
  componentDidUpdate() {
    // Runs immediately after the DOM has been updated.
    // Adjust CSS "hard-coded" popup width (240px or 480px).
    console.log('componentDidUpdate');
    const mapdim = this.getMapDimensions();
    const min_S_popup_w = mapdim.w < 240 ? mapdim.w : 240;
    const min_L_popup_w = mapdim.w < 480 ? mapdim.w : 480;
    // .leaflet-popup-content {
    //  width: 240px; or width: 480px;
    const elems = document.querySelectorAll('.leaflet-popup-content');
    [...elems].forEach(e=>{
      if (this.state.size==='S') {
        e.width = min_S_popup_w + 'px';
      } else {
        e.width = min_L_popup_w + 'px';
      }
    });
  }
  */
  componentDidMount() {
    // Runs immediately after the DOM has been updated.
    console.log('componentDidMount');
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
    window.removeEventListener('resize', this.updateDimensions);
  }
  
  handleClick = () => {
    if (this.state.size==='S') {
      this.setState(prevState => ({
        ...prevState,
        size: 'L',
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        size: 'S',
      }));
    }
  }
  
  handleClose = () => {
    this.props.leaflet.map.closePopup();
    this.props.handleSetIndex(-1);
  }
  
  getPrevButtonState = () => {
    const c_index = parseInt(this.props.pid.slice(4));
    if (this.props.autoOpen) {
       return ''; // "Previous"-button is disabled when "AUTO" mode is selected.
    }
    // "Previous"-button is enabled if current-index is not zero.
    return c_index !== 0 ? 'y' : '';
  }
  
  getToggleModeClass = () => {
    if (this.props.autoOpen) {
      if (this.props.locationState.lat===0 && this.props.locationState.lon===0) {
        return 'xtp-navi-auto-inactive';
      } else {
        return 'xtp-navi-auto';
      }
    }
    return 'xtp-navi-manual';
  }
  
  getNextButtonState = () => {
    const c_index = parseInt(this.props.pid.slice(4));
    if (this.props.autoOpen) {
       return ''; // "Next"-button is disabled when "AUTO" mode is selected.
    }
    // "Next"-button is enabled if current-index is smaller than last index.
    return c_index < this.props.xtp_last_index ? 'y' : '';
  }
  
  // Minimum width for small picture ('S') is 220px and for 'L' 460px
  // BUT never return picture width greater than leaflet-container client-width
  getPicWidth = (mapdimw) => {
    /*
    if (this.state.size==='S') {
      const min_S_pic_w = mapdimw < 220 ? mapdimw : 220;
      const w = Math.floor(mapdimw/4);
      if (w < min_S_pic_w) {
        return min_S_pic_w;
      }
      return w;
    } else {
      const min_L_pic_w = mapdimw < 460 ? mapdimw : 460;
      const w = Math.floor(mapdimw/2);
      if (w < min_L_pic_w) {
        return min_L_pic_w;
      }
      return w;
    }
    */
    let w = 0;
    let c = 0;
    if (this.state.size==='S') {
      w = Math.floor(mapdimw/4);
    } else {
      w = Math.floor(mapdimw/2);
    }
    if (w >= 0 && w < 340) {
      c = 220; // minimum popup width 240px pic 220px
    } else if (w >= 340 && w < 440) {
      c = 320;
    } else if (w >= 440 && w < 540) {
      c = 420:
    } else if (w >= 540 && w < 640) {
      c = 520;
    } else {
      c = 620;
    }
    return c;
  }
  
  getPopupClasses = (mapdimw) => {
    let w = 0;
    let c = 'popup ';
    if (this.state.size==='S') {
      w = Math.floor(mapdimw/4);
    } else {
      w = Math.floor(mapdimw/2);
    }
    if (w >= 0 && w < 340) {
      c += 'single-popup-xtp'; // minimum popup width 240px pic 220px
    } else if (w >= 340 && w < 440) {
      c += 'single-popup-xtp w340px'; // popup 340px pic 320px
    } else if (w >= 440 && w < 540) {
      c += 'single-popup-xtp w440px';
    } else if (w >= 540 && w < 640) {
      c += 'single-popup-xtp w540px';
    } else {
      c += 'single-popup-xtp w640px';
    }
  }
  
  render() {
    //console.log(['Create Popup this.props.pid=',this.props.pid]);
    const a_title = this.props.autoOpen ? 'Auto ON' : 'Auto OFF';
    const toggleModeClassName = this.getToggleModeClass();
    const prev_state = this.getPrevButtonState();
    const next_state = this.getNextButtonState();
    const p_title = prev_state==='' ? '' : '<';
    const n_title = next_state==='' ? '' : '>';
    /*
    "single-popup-xtp" => 240px
    "single-popup-xtp w300" => 340px 
    "single-popup-xtp w400" => 440px 
    "single-popup-xtp w500" => 540px 
    "single-popup-xtp w600" => 640px 
    */
    const mapdim = this.getMapDimensions();
    //const xtpClassNames = this.state.size==='S' ? 'popup single-popup-xtp' : 'popup single-popup-xtp-zoomed';
    const xtpClassNames = this.getPopupClasses(mapdim.w);
    const btnClass = this.state.size==='S' ? 'xtp-popup-navi-button' : 'xtp-popup-navi-button zoomed';
    const dimw = this.getPicWidth(mapdim.w);
    const dimwpx = dimw+'px';
    return (
      <Popup
        position={{ lat: this.props.lat+0.0001, lng: this.props.lon }}
        offset={[0, 0]}
        autoPanPaddingTopLeft={[5, 125]}
        onClose={() => {
          console.log('onClose.');
        }}
        onOpen={() => {
          const c_index = parseInt(this.props.pid.slice(4));
          console.log(['onOpen c_index=',c_index]);
          this.props.handleSetIndex(c_index);
        }}
        maxWidth={dimwpx}
        width={dimwpx}
        autoPan={false}
        className={xtpClassNames}
      >
        <Card className="no-margin">
          <div className="xtp-popup-wrapper">
            <div className="xtp-map-popup-button-container">
              <div className="xtp-map-popup-button-wrapper"><button className={toggleModeClassName} onClick={this.props.toggleAuto}>{a_title}</button></div>
              <div className="xtp-map-popup-button-wrapper"><button onClick={this.handleClose}>Close</button></div>
            </div>
            <div className="xtp-image-container">
              <img onClick={this.handleClick} src={this.props.xtpurl} width={dimw} alt="" />
              <div className="xtp-popup-left-button-wrapper"><button className={btnClass} disabled={!prev_state} onClick={this.props.handlePrev}>{p_title}</button></div>
              <div className="xtp-popup-right-button-wrapper"><button className={btnClass} disabled={!next_state} onClick={this.props.handleNext}>{n_title}</button></div>
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
