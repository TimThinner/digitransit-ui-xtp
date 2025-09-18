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
  .single-popup-xtp {
    .leaflet-popup-content {
      width: 420px;
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
  };
  
  constructor(props) {
    console.log(['constructor props=',props]);
    super(props);
    this.state = {
      picW: 200,
      picH: 267,
      zoom: this.props.leaflet.map.getZoom(),
    };
    this.popupW = 270;
    this.popupH = 360;
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
    if (this.state.picW===200) {
      this.setState(prevState => ({
        ...prevState, // keep all other key-value pairs
        picW: 300,    // update the value of specific key
        picH: 400,    // update the value of specific key
      }));
      this.popupW = 360;
      this.popupH = 480;
    } else {
      this.setState(prevState => ({
        ...prevState, // keep all other key-value pairs
        picW: 200,    // update the value of specific key
        picH: 267,    // update the value of specific key
      }));
      this.popupW = 270;
      this.popupH = 360;
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
    const title = this.props.autoOpen ? 'AUTO' : 'MANUAL';
    const prev_state = this.getPrevButtonState();
    const next_state = this.getNextButtonState();
    const xtpClassNames = this.state.picW===200 ? 'popup single-popup-xtp' : 'popup single-popup-xtp-zoomed';
    const auto_state = 'y';
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
        maxWidth={this.popupW}
        maxHeight={this.popupH}
        autoPan={true}
        className={xtpClassNames}
      >
        <Card className="no-margin">
          <div className="xtp-popup-wrapper">
            <div className="xtp-map-popup-button-container">
              <div className="xtp-map-popup-button-wrapper"><button onClick={this.handleClose}>Close</button></div>
            </div>
            <div className="location-thumbnail-image">
              <img onClick={this.handleClick} src={this.props.xtpurl} width={this.state.picW} height={this.state.picH} />
            </div>
            <div className="xtp-map-popup-button-container">
              <div className="xtp-map-popup-button-wrapper"><button disabled={!prev_state} onClick={this.props.handlePrev}>Previous</button></div>
              <div className="xtp-map-popup-button-wrapper"><button disabled={!auto_state} onClick={this.props.toggleAuto}>{title}</button></div>
              <div className="xtp-map-popup-button-wrapper"><button disabled={!next_state} onClick={this.props.handleNext}>Next</button></div>
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
