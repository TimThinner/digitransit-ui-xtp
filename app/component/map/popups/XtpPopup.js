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
  .xtp-single-popup {
    .leaflet-popup-content {
      width: 320px;
    }
  }
  .zoomed-xtp-single-popup {
    .leaflet-popup-content {
      width: 640px;
    }
  }
  
  id = 'xtp_0', 'xtp_1', etc.
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
    height:400,
    classNames:"popup xtp-single-popup"
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
  /*
  function processStyles() {
    if (xtpState.width === 300) {
      const elems = document.querySelectorAll('div.leaflet-popup-content');
      console.log(['NORMAL elems=',elems]);
      [...elems].forEach(e=>{
        console.log(['e=',e]);
        e.setAttribute('style', 'width:320px');
        console.log('NORMAL CSS style width:320px');
      });
    } else {
      const elems = document.querySelectorAll('div.leaflet-popup-content');
      console.log(['ZOOMED elems=',elems]);
      [...elems].forEach(e=>{
        console.log(['e=',e]);
        e.setAttribute('style', 'width:640px');
        console.log('ZOOMED CSS style width:640px');
      });
    }
  }
  */
  function handleClick() {
    console.log('You clicked image!');
    if (xtpState.fullscreen) {
      // back to small size
      setXtpState({fullscreen:false, width:300, height:400, classNames:"popup xtp-single-popup"});
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
      setXtpState({fullscreen:true, width:600, height:800, classNames:"popup zoomed-xtp-single-popup"});
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
    {console.log(['Create Popup xtpState.classNames=',xtpState.classNames,'pid=',pid])}
    <Popup
      position={{ lat: lat+0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      onClose={() => {
        console.log('onClose...do nothing');
      }}
      onOpen={() => {
        console.log('onOpen...do nothing');
      }}
      maxWidth={xtpState.width}
      maxHeight={xtpState.height}
      autoPan={false}
      className={xtpState.classNames}
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
