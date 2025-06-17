import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

import useWindowSize from '../../../hooks/useWindowSize';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require

export default function XtpPopup({ lat, lon, xtpurl }) {
  const [imgSize, setImgSize] = useState({fullscreen:false, width:150, height:200});
  const size = useWindowSize();

  console.log(['XtpPopup size=',size]);

  function handleClick() {
    console.log('You clicked image!');
    if (imgSize.fullscreen) {
      // back to small size
      setImgSize({fullscreen:false, width:150, height:200});
    } else {
      // make image fullscreen
      setImgSize({fullscreen:true, width:size.width-40, height:size.height-40});
    }
  }
  
  // size.width,
  // size.outer.width
  
  return (
    <Popup
      position={{ lat: lat+0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      maxWidth={size.width}
      maxHeight={size.height}
      autoPan={false}
      className="popup single-popup"
    >
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-thumbnail-image">
            <img onClick={handleClick} src={xtpurl} width={imgSize.width} height={imgSize.height} />
          </div>
        </div>
      </Card>
    </Popup>
  );
}

XtpPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  xtpurl: PropTypes.string.isRequired,
};

XtpPopup.displayName = 'XtpPopup';
