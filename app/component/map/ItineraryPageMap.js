/* eslint-disable react/no-array-index-key */
import { matchShape, routerShape } from 'found';
import PropTypes from 'prop-types';
import React from 'react';
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
import MapWithTracking from './MapWithTracking';
import VehicleMarkerContainer from './VehicleMarkerContainer';

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
  /* XTP:
  {
    "infos":[
      {
        "edge_index": 2,
        "leg_index": 3,
        "type": "photo",
        "lat": 60.175022,
        "lon": 24.804236,
        "url": "https://route-media-server.vtt.fi/photos/4hio3kj3h5hkj2kj22g3.jpg"
      }
    ]
  }
  */
  xtpPoints.forEach((xtp, i) => {
    const pos = {lat:xtp.lat, lon:xtp.lon};
    leafletObjs.push(<LocationMarker key={`xtp_${i}`} position={pos} type="xtp" xtp={xtp} />);
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
