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
  const xtpActivePoints = [];
  
  const [xtpForce, setXtpForce] = useState({auto:true,index:0});
  
  // Add size ('S') as global setting for all pictures in all XtpPopups.
  // If size is 'S' => all pics are small.
  // If size is 'L' => all pics are large.
  // This was in each XtpPopup, so that user could set each pic size individually.
  /*
  const xtpToggleSize = () => {
    if (xtpForce.size === 'S') {
      setXtpForce({...xtpForce,size:'L'});
    } else {
      setXtpForce({...xtpForce,size:'S'});
    }
    setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
  }
  */
  const xtpToggleAuto = () => {
    if (xtpForce.auto) {
      setXtpForce({...xtpForce,auto:false});
    } else {
      setXtpForce({...xtpForce,auto:true});
    }
  }
  
  const xtpHandlePrev = () => {
    const index = xtpForce.index;
    console.log(['HANDLE previous index=',index]);
    if (index > 0) {
      setXtpForce({...xtpForce,index:index-1});
    }
  }
  
  const xtpHandleNext = () => {
    const index = xtpForce.index;
    console.log(['HANDLE next index=',index]);
    if (index < xtpActivePoints.length-1) {
      setXtpForce({...xtpForce,index:index+1});
    }
  }
  
  const xtpHandleSetIndex = (new_index) => {
    if (xtpForce.index !== new_index) {
      console.log(['HANDLE SetIndex CHANGE new_index=',new_index]);
      setXtpForce({...xtpForce,index:new_index});
    }
  }

  const xtpPointsHasEdge = (edge_index) => {
    let found = false;
    xtpPoints.every(xtp => {
      if (edge_index === xtp.edge_index) {
        found = true;
        return false; // break out from the every-loop.
      }
      return true; // continue with next item
    });
    return found;
  }

  const get_alternate_polyline = (active, legi) => {
    let ap = '';
    xtpPoints.every(xtp => {
      if (active === xtp.edge_index && legi === xtp.leg_index) {
        ap = xtp.alternate_polyline;
        return false; // break out from the every-loop.
      }
      return true; // continue with next item
    });
    return ap;
  }
  // instead of cloning legs always, maybe it is better to
  // check if xtpPoints has values for this edge.
  // This can be easily checked:
  // if (xtpPointsHasEdge(active)) { ...
  // 
  const clone_legs = (old_legs, active) => {
    const new_legs = []
    old_legs.forEach((leg, legi)=>{
      const new_leg = {};
      Object.keys(leg).forEach(key=>{
        if (key !== 'legGeometry') {
          new_leg[key] = leg[key] // copy as it is.
        } else {
          const altpolyline = get_alternate_polyline(active, legi);
          if (altpolyline && altpolyline.length > 0) {
            new_leg['legGeometry'] = { points:altpolyline };
          } else {
            new_leg['legGeometry'] = leg['legGeometry']; // use old legGeometry
          }
        }
      });
      new_legs.push(new_leg);
    });
    return new_legs;
  }
  
  if (showVehicles) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon topics={topics} />,
    );
  }

  if (itinerary) {
    console.log(['itinerary => ItineraryLine itinerary.legs=',itinerary.legs]);
    const alt_legs = xtpPointsHasEdge(active) ? clone_legs(itinerary.legs, active) : itinerary.legs;
    console.log(['alt_legs=',alt_legs]);
    leafletObjs.push(
      <ItineraryLine
        key={`line_${active}`}
        hash={active}
        streetMode={hash}
        legs={alt_legs} //{itinerary.legs}
        showIntermediateStops
        showDurationBubble={showDurationBubble}
        realtimeTransfers={realtimeTransfers}
      />,
    );
  } else {
    if (!showActiveOnly) {
      planEdges.forEach((edge, i) => {
        if (i !== active) {
          console.log(['!showActiveOnly => ItineraryLine edge.node.legs=',edge.node.legs]);
          const alt_legs = xtpPointsHasEdge(i) ? clone_legs(edge.node.legs, i) : edge.node.legs;
          console.log(['alt_legs=',alt_legs]);
          leafletObjs.push(
            <ItineraryLine
              key={`line_${i}`}
              hash={i}
              legs={alt_legs} // {edge.node.legs}
              passive
            />,
          );
        }
      });
    }
    if (active < planEdges.length) {
      console.log(['active < planEdges.length => planEdges[active].node.legs=',planEdges[active].node.legs]);
      const alt_legs = xtpPointsHasEdge(active) ? clone_legs(planEdges[active].node.legs, active) : planEdges[active].node.legs;
      console.log(['alt_legs=',alt_legs]);
      leafletObjs.push(
        <ItineraryLine
          key={`line_${active}`}
          hash={active}
          streetMode={hash}
          legs={alt_legs} // {planEdges[active].node.legs}
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
  
  viaPoints.forEach((via, i) => {
    leafletObjs.push(<LocationMarker key={`via_${i}`} position={via} />);
  });

  /*
  active is the active edge => when we show camera-icons, we must show only those 
  where active === edge_index
  Send also the whole list of xtpActivePoints to each XtpLocationMarker.
  XtpLocationMarker has the knowledge of user location => it is able to detect which 
  marker is closest to user location, see autoOpen.
  */
  xtpPoints.forEach((xtp) => {
    if (active === xtp.edge_index) {
      xtpActivePoints.push(xtp);
    }
  });
  const xtp_last_index = xtpActivePoints.length-1;
  xtpActivePoints.forEach((xtp, i) => {
    //console.log(['ACTIVE MARKERS i=',i,'XTP=',xtp]);
    const pid = 'xtp_'+i;
    const pos = {lat:xtp.lat, lon:xtp.lon};
    leafletObjs.push(
      <XtpLocationMarker
        key={`xtp_${i}`}
        position={pos}
        type="xtp"
        xtp={xtp}
        xtp_last_index={xtp_last_index}
        xtp_active_markers={xtpActivePoints}
        pid={pid}
        xtpToggleAuto={xtpToggleAuto}
        xtpHandlePrev={xtpHandlePrev}
        xtpHandleNext={xtpHandleNext}
        xtpHandleSetIndex={xtpHandleSetIndex}
        xtpForce={xtpForce}
      />
    );
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
