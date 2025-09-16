/* eslint-disable react/no-array-index-key */
import { matchShape, routerShape } from 'found';
import PropTypes from 'prop-types';
//import React from 'react';
import React, { useState } from 'react';
import { onLocationPopup } from '../../util/queryUtils';
import {
  configShape,
  itineraryShape,
  locationShape,
  xtpShape,
  planEdgeShape,
} from '../../util/shapes';
import BackButton from '../BackButton';
import CookieSettingsButton from '../CookieSettingsButton';
import ItineraryLine from './ItineraryLine';
import LocationMarker from './LocationMarker';
import XtpLocationMarker from './XtpLocationMarker';
import ParkingAreaMarker from './non-tile-layer/ParkingAreaMarker';
import MapWithTracking from './MapWithTracking';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import { legContainsBikePark, legContainsCarPark } from '../../util/legUtils';

const POINT_FOCUS_ZOOM = 17; // default

const ItineraryPageMap = (
  {
    planEdges,
    active,
    showActiveOnly,
    from,
    to,
    viaPoints,
    xtpPoints,
    breakpoint,
    showVehicles,
    topics,
    showDurationBubble,
    itinerary,
    showBackButton,
    isLocationPopupEnabled,
    realtimeTransfers,
    ...rest
  },
  { match, router, executeAction, config },
) => {
  const { hash } = match.params;
  const leafletObjs = [];
  const xtpActiveMarkers = [];
  
  const [xtpForce, setXtpForce] = useState({auto:true,index:0});
  
  const xtpToggleAuto = () => {
    if (xtpForce.auto) {
      setXtpForce({...xtpForce,auto:false}); // State change => re-render
    } else {
      setXtpForce({...xtpForce,auto:true}); // State change => re-render
    }
  }
  
  const xtpHandlePrev = () => {
    const index = xtpForce.index;
    console.log(['HANDLE previous index=',index]);
    if (index > 0) {
      setXtpForce({...xtpForce,index:index-1}); // State change => re-render
    }
  };
  
  const xtpHandleNext = () => {
    const index = xtpForce.index;
    console.log(['HANDLE next index=',index]);
    if (index < xtpActiveMarkers.length-1) {
      setXtpForce({...xtpForce,index:index+1}); // State change => re-render
    }
  };
  
  if (showVehicles) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon topics={topics} />,
    );
  }

  if (itinerary) {
    leafletObjs.push(
      <ItineraryLine
        key={`line_${active}`}
        hash={active}
        streetMode={hash}
        legs={itinerary.legs}
        showIntermediateStops
        showDurationBubble={showDurationBubble}
        realtimeTransfers={realtimeTransfers}
      />,
    );
  } else {
    if (!showActiveOnly) {
      planEdges.forEach((edge, i) => {
        if (i !== active) {
          leafletObjs.push(
            <ItineraryLine
              key={`line_${i}`}
              hash={i}
              legs={edge.node.legs}
              passive
            />,
          );
        }
      });
    }
    if (active < planEdges.length) {
      leafletObjs.push(
        <ItineraryLine
          key={`line_${active}`}
          hash={active}
          streetMode={hash}
          legs={planEdges[active].node.legs}
          showIntermediateStops
          showDurationBubble={showDurationBubble}
          realtimeTransfers={realtimeTransfers}
        />,
      );
      planEdges[active].node.legs.filter(legContainsBikePark).forEach(leg => {
        leafletObjs.push(
          <ParkingAreaMarker
            key={`parking-${leg.to.lat + leg.to.lon}`}
            position={leg.to}
            type="bike"
            liipiId={leg.to.vehicleParking.vehicleParkingId}
          />,
        );
      });

      planEdges[active].node.legs.filter(legContainsCarPark).forEach(leg => {
        leafletObjs.push(
          <ParkingAreaMarker
            key={`parking-${leg.to.lat + leg.to.lon}`}
            position={leg.to}
            type="car"
            liipiId={leg.to.vehicleParking.vehicleParkingId}
          />,
        );
      });
    }
  }
  
  if (from.lat && from.lon) {
    leafletObjs.push(
      <LocationMarker key="fromMarker" position={from} type="from" />,
    );
  }
  if (to.lat && to.lon) {
    leafletObjs.push(<LocationMarker key="toMarker" position={to} type="to" />);
  }
  /*
  active is the active edge => when we show camera-icons, we must show only those 
  where active === edge_index
  Send also the whole list of xtpActiveMarkers to each XtpLocationMarker.
  XtpLocationMarker has the knowledge of user location => it is able to detect which 
  marker is closest to user location, see autoOpen.
  */
  xtpPoints.forEach((xtp) => {
    if (active === xtp.edge_index) {
      xtpActiveMarkers.push(xtp);
    }
  });
  const xtp_last_index = xtpActiveMarkers.length-1;
  xtpActiveMarkers.forEach((xtp, i) => {
    console.log(['ACTIVE MARKERS i=',i,'XTP=',xtp]);
    const pid = 'xtp_'+i;
    const pos = {lat:xtp.lat, lon:xtp.lon};
    leafletObjs.push(
      <XtpLocationMarker
        key={`xtp_${i}`}
        position={pos}
        type="xtp"
        xtp={xtp}
        xtp_last_index={xtp_last_index}
        xtp_active_markers={xtpActiveMarkers}
        pid={pid}
        xtpToggleAuto={xtpToggleAuto}
        xtpHandlePrev={xtpHandlePrev}
        xtpHandleNext={xtpHandleNext}
        xtpForce={xtpForce}
      />
    );
  });
  
  viaPoints.forEach((via, i) => {
    leafletObjs.push(<LocationMarker key={`via_${i}`} position={via} />);
  });

  let locationPopup = 'none';
  let onSelectLocation;

  if (isLocationPopupEnabled) {
    // max 5 viapoints
    locationPopup =
      config.viaPointsEnabled && viaPoints.length < 5
        ? 'all'
        : 'origindestination';
    onSelectLocation = (item, id) =>
      onLocationPopup(item, id, router, match, executeAction);
  }

  return (
    <MapWithTracking
      leafletObjs={leafletObjs}
      locationPopup={locationPopup}
      onSelectLocation={onSelectLocation}
      zoom={POINT_FOCUS_ZOOM}
      {...rest}
    >
      {showBackButton && breakpoint !== 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          fallback="pop"
        />
      )}

      {breakpoint === 'large' && config.useCookiesPrompt && (
        <CookieSettingsButton />
      )}
    </MapWithTracking>
  );
};

ItineraryPageMap.propTypes = {
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  topics: PropTypes.arrayOf(
    PropTypes.shape({
      feedId: PropTypes.string.isRequired,
      mode: PropTypes.string,
      direction: PropTypes.number,
    }),
  ),
  active: PropTypes.number.isRequired,
  showActiveOnly: PropTypes.bool,
  breakpoint: PropTypes.string.isRequired,
  showVehicles: PropTypes.bool,
  from: locationShape.isRequired,
  to: locationShape.isRequired,
  xtpPoints: PropTypes.arrayOf(xtpShape),
  viaPoints: PropTypes.arrayOf(locationShape).isRequired,
  showDurationBubble: PropTypes.bool,
  itinerary: itineraryShape,
  showBackButton: PropTypes.bool,
  isLocationPopupEnabled: PropTypes.bool,
  realtimeTransfers: PropTypes.bool,
};

ItineraryPageMap.defaultProps = {
  topics: undefined,
  showActiveOnly: false,
  showVehicles: false,
  xtpPoints: [],
  showDurationBubble: false,
  itinerary: undefined,
  showBackButton: true,
  isLocationPopupEnabled: false,
  realtimeTransfers: false,
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: configShape,
  executeAction: PropTypes.func.isRequired,
};

export default ItineraryPageMap;
