import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { configShape } from '../../../util/shapes';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

import useWindowSize from '../../../hooks/useWindowSize';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require

export default function XtpPopup({ lat, lon, xtpurl }) {
  const [imgSize, setImgSize] = useState({fullscreen:false, width:300, height:400});
  const size = useWindowSize();
  
  console.log(['imgSize.width=',imgSize.width, 'imgSize.height=',imgSize.height]);
  
  function handleClick() {
    console.log('You clicked image!');
    if (imgSize.fullscreen) {
      // back to small size
      setImgSize({fullscreen:false, width:300, height:400});
    } else {
      // make image fullscreen
      
      // Keep aspect ratio 3/4
      const new_w = 300*size.height/400;
      console.log(['XtpPopup size=',size, 'new_w=',new_w]);
      setImgSize({fullscreen:true, width:new_w, height:size.height});
    }
  }
  // maxWidth={imgSize.width}
  /*
  in map.scss:
  .single-popup {
    .leaflet-popup-content {
      width: 320px;
    }
  }
  .xtp-single-popup {
    .leaflet-popup-content {
      width: auto;
    }
  }
  */
  return (
    <Popup
      position={{ lat: lat+0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      maxWidth={imgSize.width}
      maxHeight={imgSize.height}
      autoPan={false}
      className="popup xtp-single-popup"
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
