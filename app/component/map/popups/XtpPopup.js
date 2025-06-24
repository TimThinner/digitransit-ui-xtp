import PropTypes from 'prop-types';
import React, { useState } from 'react';
//import React, { useRef, useState } from 'react';
import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

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
    setTimeout(() => {
      if (headerRef.current) {
        headerRef.current.focus();
      }
    }, 500);
  
*/
export default function XtpPopup({ pid, lat, lon, xtpurl }) {
  
  const [xtpState, setXtpState] = useState({
    fullscreen:false,
    width:300,
    height:400
  });
  //const size = useWindowSize();
  
  console.log(['xtpState=',xtpState]);
  
  function closePopup() {
    const elems = document.querySelectorAll('a.leaflet-popup-close-button');
    console.log(['closePopup elems=',elems]);
    [...elems].forEach(e=>{
      e.click();
    });
  }
  
  function openPopup() {
    const elems = document.querySelectorAll('.'+pid);
    console.log(['openPopup elems=',elems]);
    [...elems].forEach(e=>{
      e.click();
    });
  }
  
  function resetStyles() {
    const elems = document.querySelectorAll('div.leaflet-popup-content');
    console.log(['NORMAL elems=',elems]);
    [...elems].forEach(e=>{
      console.log(['e=',e]);
      e.setAttribute('style', 'width:320px; height:420px; padding:10px;');
      console.log('NORMAL CSS style');
    });
  }
  
  function processStyles() {
    if (xtpState.width === 300) {
      const elems = document.querySelectorAll('div.leaflet-popup-content');
      console.log(['NORMAL elems=',elems]);
      [...elems].forEach(e=>{
        console.log(['e=',e]);
        e.setAttribute('style', 'width:320px; height:420px; padding:10px;');
        console.log('NORMAL CSS style');
      });
    } else {
      const elems = document.querySelectorAll('div.leaflet-popup-content');
      console.log(['ZOOMED elems=',elems]);
      [...elems].forEach(e=>{
        console.log(['e=',e]);
        e.setAttribute('style', 'width:620px; height:820px; padding:10px;');
        console.log('ZOOMED CSS style');
      });
    }
  }
  
  function handleClick() {
    console.log('You clicked image!');
    if (xtpState.fullscreen) {
      // back to small size
      setXtpState({fullscreen:false, width:300, height:400});
      setTimeout(() => {
        closePopup();
        setTimeout(() => {
          openPopup();
        }, 100);
      }, 100);
    } else {
      // make image fullscreen
      // Keep aspect ratio 3/4
      //const new_h = size.height-40;
      //const new_w = Math.round(300*size.height/400);
      //setImgSize({fullscreen:true, width:new_w, height:new_h});
      setXtpState({fullscreen:true, width:600, height:800});
      setTimeout(() => {
        closePopup();
        setTimeout(() => {
          openPopup();
        }, 100);
      }, 100);
    }
  }
  
  return (
    <>
    {console.log(['Create Popup pid=',pid])}
    <Popup
      position={{ lat: lat+0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      onClose={() => {
        console.log('onClose... resetStyles.');
        resetStyles();
      }}
      onOpen={() => {
        console.log('onOpen... processStyles.');
        processStyles();
      }}
      maxWidth={xtpState.width}
      maxHeight={xtpState.height}
      autoPan={false}
      className="popup single-popup"
    >
      {console.log('Create Card')}
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-thumbnail-image">
            <img onClick={handleClick} src={xtpurl} width={xtpState.width} height={xtpState.height} />
          </div>
        </div>
      </Card>
    </Popup>
    </>
  );
}

XtpPopup.propTypes = {
  pid: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  xtpurl: PropTypes.string.isRequired,
};

XtpPopup.displayName = 'XtpPopup';
