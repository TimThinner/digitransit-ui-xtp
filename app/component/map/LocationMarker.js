import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { xtpShape } from '../../util/shapes';

import Icon from '../Icon';
import IconMarker from './IconMarker';
import ViaPointPopup from './popups/ViaPointPopup';
import XtpPopup from './popups/XtpPopup';
import XtpTestPopup from './popups/XtpTestPopup';

export default function LocationMarker({
  position,
  type,
  className,
  isLarge,
  disabled,
  xtp,
  xtp_last_index,
  pid,
}) {
  const getValidType = markertype => {
    switch (markertype) {
      case 'from':
        return 'from';
      case 'to':
        return 'to';
      case 'xtp':
        return 'xtp';
      case 'via':
      default:
        return 'via';
    }
  };
  /*
  XTP: We want to show different icon for XTP "LocationMarker".
  In case of Xtp change img from:
    img="icon-icon_mapMarker-map"
  to:
    img="icon-icon_mapMarker-xtp-map"
  
  Remember to define following SVG symbol in files: 
    svg-sprite.default.svg
    svg-sprite.hsl.svg
  
  <symbol id="icon-icon_mapMarker-xtp-map" viewBox="0 0 40 40" fill="none">
  <path fill="none" stroke="#b40" stroke-width="2" d="M 20 6 L 28 6 L 28 10 L 38 10 L 38 36 L 2 36 L 2 10 L 12 10 L 12 6 L 20 6" />
  <circle fill="none" stroke="#b40" stroke-width="2" cx="20" cy="23" r="8"/>
  <circle fill="none" stroke="#b40" stroke-width="2" cx="33" cy="15" r="1"/>
  </symbol>
  
  
  New: Add pid ('xtp_0', 'xtp_1', etc.) to IconMarker classes.
  
  
  */
  //const xtp_marker_next = () => {
    //console.log('xtp_marker_next');
  //}
  
  const validType = getValidType(type);
  const validTypeXtp = validType === 'xtp' ? '-xtp' : '';
  const sideLength = isLarge ? 30 : 24;
  
  const test_classes = cx(validType, className, pid);
  console.log(['LocationMarker test_classes=',test_classes]);
  
  const marker = (
    <IconMarker
      position={position}
      className={cx(validType, className, pid)}
      icon={{
        className: cx(validType, className, pid),
        element: (
          <Icon
            img={`icon-icon_mapMarker${validTypeXtp}-map`}
            color={disabled ? '#bbbbbb' : null}
          />
        ),
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
      zIndexOffset={12000}
    >
      {validType === 'xtp' && (
        <XtpTestPopup
          lat={xtp.lat}
          lon={xtp.lon}
          xtpurl={xtp.url}
          key={`${xtp.lat}${xtp.lon}`}
          xtp_last_index={xtp_last_index}
          pid={pid}
        />
      )}
      {validType === 'via' && (
        <ViaPointPopup
          lat={position.lat}
          lon={position.lon}
          key={`${position.lat}${position.lon}`}
        />
      )}
    </IconMarker>
  );
  return marker;
}
/*
key
position
type
xtp
xtp_last_index
pid
*/
LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  type: PropTypes.oneOf(['from', 'via', 'to', 'xtp', 'favourite']),
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  disabled: PropTypes.bool,
  xtp: xtpShape,
  xtp_last_index: PropTypes.number,
  pid: PropTypes.string,
};

LocationMarker.defaultProps = {
  position: undefined,
  type: 'via',
  className: undefined,
  isLarge: false,
  disabled: false,
  xtp: undefined,
  xtp_last_index: undefined,
  pid: undefined,
};
