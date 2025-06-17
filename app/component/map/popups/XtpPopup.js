import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

import useWindowSize from '../../../hooks/useWindowSize';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require

export default function XtpPopup({ lat, lon, xtpurl }) {
  const [imgZoomed, setImgZoomed] = useState(false);
  const size = useWindowSize();
  let imgWidth = 300;
  let imgHeight = 400;

  function handleClick() {
    console.log('You clicked image!');
    if (imgZoomed) {
      // back to small size
      setImgZoomed(false);
      imgWidth = 300;
      imgHeight = 400;
    } else {
      // zoom to full size
      setImgZoomed(true);
      imgWidth = size.width;
      imgHeight = size.height;
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
            <img onClick={handleClick} src={xtpurl} width={imgWidth} height={imgHeight} />
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
