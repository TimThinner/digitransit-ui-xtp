import PropTypes from 'prop-types';
//import React, { useState } from 'react';
//import React, { useRef, useState, useEffect } from 'react';
import React from 'react';
//import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';
import { withLeaflet } from 'react-leaflet/es/context'; // New for Leaflet access.

//import useWindowSize from '../../../hooks/useWindowSize';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require
//import Popup from 'react-leaflet/es/Popup';
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

class XtpTestPopup extends React.Component {
  
  static displayName = 'XtpTestPopup';

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
  };
  
  constructor(props) {
    console.log(['constructor props=',props]);
    super(props);
    this.state = {
      clicked: false, // toggles false / true
      zoom: this.props.leaflet.map.getZoom(),
    };
    this.dimensions = {picW:300, picH:400, popupW:300, popupH:400};
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
  
  componentDidMount() {
    console.log('componentDidMount');
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  }
  
  render() {
    console.log(['Create Popup this.props.pid=',this.props.pid]);
    //console.log('Create Popup');
    return (
      <Popup
        position={{ lat: this.props.lat+0.0001, lng: this.props.lon }}
        offset={[0, 0]}
        autoPanPaddingTopLeft={[5, 125]}
        maxWidth={this.dimensions.popupW}
        maxHeight={this.dimensions.popupH}
        autoPan={true}
        className="popup single-popup"
      >
        {console.log('Create Card')}
        <Card className="no-margin">
          <div className="location-popup-wrapper">
            <p>TESTING...</p>
          </div>
        </Card>
      </Popup>
    );
  }
}

const XtpTestPopupWithLeaflet = withLeaflet(XtpTestPopup);

export {
  XtpTestPopupWithLeaflet as default,
  XtpTestPopup as Component,
};
