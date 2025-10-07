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
      picW: 240,
      picH: 320,
      zoom: this.props.leaflet.map.getZoom(),
    };
  }
  
  onMapZoom = () => {
    // Toggle the state to re-render component
    const zoom = this.props.leaflet.map.getZoom();
    this.setState(prevState => ({
      ...prevState, // keep all other key-value pairs
      zoom: zoom    // update the value of specific key
    }));
  }
  
  componentDidMount() {
    console.log('componentDidMount');
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  }
  
  handleClick = () => {
    if (this.state.picW===240) {
      this.setState(prevState => ({
        ...prevState,
        picW: 480,
        picH: 640,
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        picW: 240,
        picH: 320,
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
  
  render() {
    //console.log(['Create Popup this.props.pid=',this.props.pid]);
    const a_title = this.props.autoOpen ? 'Auto ON' : 'Auto OFF';
    const toggleModeClassName = this.getToggleModeClass();
    //const toggleModeClassName = this.props.autoOpen ? 'xtp-navi-auto' : 'xtp-navi-manual';
    // Try how the map behaves when autoPanning is always true.
    //const autoPan = this.props.autoOpen ? false : true; // Automatic pan in manual mode.
    const prev_state = this.getPrevButtonState();
    const next_state = this.getNextButtonState();
    const p_title = prev_state==='' ? '' : '<';
    const n_title = next_state==='' ? '' : '>';
    const xtpClassNames = this.state.picW===240 ? 'popup single-popup-xtp' : 'popup single-popup-xtp-zoomed';
    const btnClass = this.state.picW===240 ? 'xtp-popup-navi-button' : 'xtp-popup-navi-button zoomed';
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
        maxWidth={this.state.picW+'px'}
        width={this.state.picW+'px'}
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
              <img onClick={this.handleClick} src={this.props.xtpurl} width={this.state.picW} height={this.state.picH} alt="" />
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
