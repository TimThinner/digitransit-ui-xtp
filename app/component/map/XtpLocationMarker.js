import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { 
  xtpShape,
  locationShape,
} from '../../util/shapes';
import Icon from '../Icon';
import XtpIconMarker from './XtpIconMarker';
import XtpPopup from './popups/XtpPopup';
// New imports to add locationState into this component
import PositionStore from '../../store/PositionStore';
import { connectToStores } from 'fluxible-addons-react';
/*
key
position
type
xtp
xtp_last_index
pid
*/
//export default function XtpLocationMarker({
function XtpLocationMarker(props) {
  //position,
  //type,
  //className,
  //isLarge,
  //disabled,
  //xtp,
  //xtp_last_index,
  //pid,
  //}) {

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
  const sideLength = props.isLarge ? 30 : 24;
  
  const test_classes = cx(validType, props.className, props.pid);
  console.log(['LocationMarker test_classes=',test_classes]);
  
  function closePopup() {
    const elems = document.querySelectorAll('a.leaflet-popup-close-button');
    console.log(['closePopup elems=',elems]);
    [...elems].forEach(e=>{
      e.click();
    });
  }
  
  function openPopup(a_pid) {
    const elems = document.querySelectorAll('.'+a_pid);
    console.log(['openPopup elems=',elems]);
    [...elems].forEach(e=>{
      e.click();
    });
  }
  
  return (
    <XtpIconMarker
      position={props.position}
      className={cx(validType, props.className, props.pid)}
      icon={{
        className: cx(validType, props.className, props.pid),
        element: (
          <Icon
            img={`icon-icon_mapMarker-xtp-map`}
            color={props.disabled ? '#bbbbbb' : null}
          />
        ),
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
      zIndexOffset={12000}
    >
      {console.log(['REFRESH XtpPopup props=',props])}
      <XtpPopup
        lat={props.xtp.lat}
        lon={props.xtp.lon}
        xtpurl={props.xtp.url}
        key={`${props.xtp.lat}${props.xtp.lon}`}
        xtp_last_index={props.xtp_last_index}
        pid={props.pid}
        openPopup={openPopup}
        closePopup={closePopup}
      />
    </XtpIconMarker>
  );
}

XtpLocationMarker.propTypes = {
  position: XtpIconMarker.propTypes.position,
  type: PropTypes.oneOf(['from', 'via', 'to', 'xtp', 'favourite']),
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  disabled: PropTypes.bool,
  xtp: xtpShape,
  xtp_last_index: PropTypes.number,
  pid: PropTypes.string,
  locationState: locationShape,
};

XtpLocationMarker.defaultProps = {
  position: undefined,
  type: 'xtp',
  className: undefined,
  isLarge: false,
  disabled: false,
  xtp: undefined,
  xtp_last_index: undefined,
  pid: undefined,
  locationState: undefined,
};
/*
How to add locationState into this component?
*/
const XtpLocationMarkerWithStores = connectToStores(
  XtpLocationMarker,
  [PositionStore],
  ({ getStore }) => {
    const locationState = getStore(PositionStore).getLocationState();
    return { locationState };
  },
);
export { XtpLocationMarkerWithStores as default, XtpLocationMarker as Component };
