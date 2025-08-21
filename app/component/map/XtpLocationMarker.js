import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { xtpShape } from '../../util/shapes';

import Icon from '../Icon';
import XtpIconMarker from './XTPIconMarker';
/*
import XtpPopup from './popups/XtpPopup';
import XtpTestPopup from './popups/XtpTestPopup';
*/
export default function XtpLocationMarker({
  position,
  type,
  className,
  isLarge,
  disabled,
  xtp,
  xtp_last_index,
  pid,
  onClickMarker,
}) {
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
  
  const validType = 'xtp';
  const sideLength = isLarge ? 30 : 24;
  
  const test_classes = cx(validType, className, pid);
  console.log(['LocationMarker test_classes=',test_classes]);
  
  const marker = (
    <XtpIconMarker
      position={position}
      className={cx(validType, className, pid)}
      icon={{
        className: cx(validType, className, pid),
        element: (
          <Icon
            img={`icon-icon_mapMarker-xtp-map`}
            color={disabled ? '#bbbbbb' : null}
          />
        ),
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
      zIndexOffset={12000}
      onClickMarker={onClickMarker}
    >
      {validType === 'via' && (
        <ViaPointPopup
          lat={position.lat}
          lon={position.lon}
          key={`${position.lat}${position.lon}`}
        />
      )}
    </XtpIconMarker>
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
XtpLocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  type: PropTypes.oneOf(['from', 'via', 'to', 'xtp', 'favourite']),
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  disabled: PropTypes.bool,
  xtp: xtpShape,
  xtp_last_index: PropTypes.number,
  pid: PropTypes.string,
  onClickMarker: PropTypes.func,
};

XtpLocationMarker.defaultProps = {
  position: undefined,
  type: 'via',
  className: undefined,
  isLarge: false,
  disabled: false,
  xtp: undefined,
  xtp_last_index: undefined,
  pid: undefined,
  onClickMarker: undefined,
};
