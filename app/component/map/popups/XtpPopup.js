import PropTypes from 'prop-types';
//import React, { useState } from 'react';
import React, { useRef, useState, useEffect } from 'react';
//import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';
import { withLeaflet } from 'react-leaflet/es/context'; // New for Leaflet access.

//import useWindowSize from '../../../hooks/useWindowSize';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require
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
        getZoom: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    
    pid: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    xtpurl: PropTypes.string.isRequired,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      zoomend: false,
    };
    this.fullScreen = false;
    this.popupWidth = 300;
    this.popupHeight = 400;
    this.autoClose = false;
  }
  
  //const size = useWindowSize();
  
  onMapZoom = () => {
    // Toggle the state to re-render component
    console.log(['onMapZoom this.state.zoomend=',this.state.zoomend]);
    if (this.state.zoomend) {
      this.setState({zoomend: false});
    } else {
      this.setState({zoomend: true});
    }
  }
  
  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  }

  closePopup = () => {
    const elems = document.querySelectorAll('a.leaflet-popup-close-button');
    console.log(['closePopup elems=',elems]);
    [...elems].forEach(e=>{
      e.click();
    });
  }

  openPopup = () => {
    const elems = document.querySelectorAll('.'+this.props.pid);
    console.log(['openPopup elems=',elems]);
    [...elems].forEach(e=>{
      e.click();
    });
  }
  
  resetStyles = () => {
    const elems = document.querySelectorAll('div.leaflet-popup-content');
    console.log(['RESET STYLES elems=',elems]);
    [...elems].forEach(e=>{
      //console.log(['e=',e]);
      //e.setAttribute('style', 'width:320px; height:420px; padding:10px;');
      e.style.width = "320px";
      e.style.height = "420px";
      e.style.padding = "10px";
      console.log('NORMAL CSS style');
    });
  }
  
  resetPopupLeft = () => {
    const elems = document.querySelectorAll('div.single-popup');
    console.log(['RESET Popup Left elems=',elems]);
    [...elems].forEach(e=>{
      e.style.left = "-150px";
    });
  }
  
  processStyles = () => {
    const elems = document.querySelectorAll('div.leaflet-popup-content');
    console.log(['PROCESS STYLES elems=',elems]);
    [...elems].forEach(e=>{
      //console.log(['e=',e]);
      if (this.fullScreen) {
        //e.setAttribute('style', 'width:620px; height:820px; padding:10px;');
        e.style.width = "620px";
        e.style.height = "820px";
        e.style.padding = "10px";
        console.log('ZOOMED CSS style');
      } else {
        //e.setAttribute('style', 'width:320px; height:420px; padding:10px;');
        e.style.width = "320px";
        e.style.height = "420px";
        e.style.padding = "10px";
        console.log('NORMAL CSS style');
      }
    });
  }
  
  processPopupLeft = () => {
    const elems = document.querySelectorAll('div.single-popup');
    console.log(['PROCESS Popup Left elems=',elems]);
    [...elems].forEach(e=>{
      //console.log(['e=',e]);
      if (this.fullScreen) {
        e.style.left = "-300px";
      } else {
        e.style.left = "-150px";
      }
    });
  }
  /*
  Keep aspect ratio 3/4
  const new_h = size.height-40;
  const new_w = Math.round(300*size.height/400);
  setImgSize({fullscreen:true, width:new_w, height:new_h});
  */
  handleClick = () => {
    console.log('TOGGLE image!');
    if (this.fullScreen) { // back to small size
      this.fullScreen = false;
      this.popupWidth =  300;
      this.popupHeight = 400;
    } else { // make image fullscreen
      this.fullScreen = true;
      this.popupWidth =  600;
      this.popupHeight = 800;
    }
    // Toggle the state to re-render component
    if (this.state.clicked) {
      this.setState({clicked: false});
    } else {
      this.setState({clicked: true});
    }
    this.autoClose = true;
    setTimeout(() => {
      this.closePopup();
      setTimeout(() => {
        this.openPopup();
      }, 100);
    }, 100);
  };
  
  render() {
  
  return (
    <>
    {console.log(['Create Popup this.props.pid=',this.props.pid])}
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
          this.popupWidth =  300;
          this.popupHeight = 400;
          this.resetStyles();
          this.resetPopupLeft();
        }
      }}
      onOpen={() => {
        console.log('onOpen... process.');
        this.processStyles();
        this.processPopupLeft();
      }}
      maxWidth={this.popupWidth}
      maxHeight={this.popupHeight}
      autoPan={true}
      className="popup single-popup"
    >
      {console.log('Create Card')}
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-thumbnail-image">
            <img onClick={this.handleClick} src={this.props.xtpurl} width={this.popupWidth} height={this.popupHeight} />
          </div>
        </div>
      </Card>
    </Popup>
    </>
  );
  }
}

const XtpPopupWithLeaflet = withLeaflet(XtpPopup);

export {
  XtpPopupWithLeaflet as default,
  XtpPopup as Component,
};
