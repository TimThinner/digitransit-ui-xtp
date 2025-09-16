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
    handlePrev: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired,
    toggleAuto: PropTypes.func.isRequired,
    autoOpen: PropTypes.bool.isRequired,
  };
  
  constructor(props) {
    console.log(['constructor props=',props]);
    super(props);
    this.state = {
      popup: {
        picW: 300,
        picH: 400, 
        zoom: this.props.leaflet.map.getZoom(),
      },
    };
    this.popupW = 320;
    this.popupH = 420;
  }
  
  onMapZoom = () => {
    // Toggle the state to re-render component
    const zoom = this.props.leaflet.map.getZoom();
    console.log(['onMapZoom zoom=',zoom]);
    this.setState(prevState => ({
      popup: {              // object that we want to update
        ...prevState.popup, // keep all other key-value pairs
        zoom: zoom          // update the value of specific key
      }
    }));
    //this.setState({zoom:zoom});
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
    if (this.state.picW===300) {
      console.log('handleClick picW===300 setState 600x800');
      this.setState(prevState => ({
        popup: {              // object that we want to update
          ...prevState.popup, // keep all other key-value pairs
          picW: 600,           // update the value of specific key
          picH: 800,           // update the value of specific key
        }
      }));
      //this.setState({picW:600,picH:800});
      this.popupW = 620;
      this.popupH = 820;
    } else {
      console.log('handleClick picW===600 setState 300x400');
      this.setState(prevState => ({
        popup: {              // object that we want to update
          ...prevState.popup, // keep all other key-value pairs
          picW: 300,           // update the value of specific key
          picH: 400,           // update the value of specific key
        }
      }));
      //this.setState({picW:300,picH:400});
      this.popupW = 320;
      this.popupH = 420;
    }
  }
  
  render() {
    console.log(['Create Popup this.props.pid=',this.props.pid]);
    const c_index = parseInt(this.props.pid.slice(4));
    const prev_state = c_index !== 0 ? 'y' : ''; // "Previous"-button is disabled when prev_state is empty
    const next_state = c_index < this.props.xtp_last_index ? 'y' : ''; // "Next"-button is disabled when next_state is empty
    const stop_state = 'y';
    const title = this.props.autoOpen ? 'AUTO' : 'MANUAL';
    return (
      <Popup
        position={{ lat: this.props.lat+0.0001, lng: this.props.lon }}
        offset={[0, 0]}
        autoPanPaddingTopLeft={[5, 125]}
        onClose={() => {
          console.log('onClose.');
        }}
        onOpen={() => {
          console.log('onOpen.');
        }}
        maxWidth={this.popupW}
        maxHeight={this.popupH}
        autoPan={true}
        className="popup single-popup"
      >
        <Card className="no-margin">
          <div className="location-popup-wrapper">
            <div className="location-thumbnail-image">
              <img onClick={this.handleClick} src={this.props.xtpurl} width={this.state.picW} height={this.state.picH} />
            </div>
            <div className="xtp-map-popup-button-container">
              <div className="xtp-map-popup-button-wrapper"><button disabled={!prev_state} onClick={this.props.handlePrev}>Previous</button></div>
              <div className="xtp-map-popup-button-wrapper"><button disabled={!stop_state} onClick={this.props.toggleAuto}>{title}</button></div>
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
