import PropTypes from 'prop-types';
import React from 'react';
import ItineraryDetails from './ItineraryDetails';

import SwipeableTabs from '../SwipeableTabs';
import { planEdgeShape, xtpShape } from '../../util/shapes';

/* eslint-disable react/no-array-index-key */

function ItineraryTabs({ planEdges, xtpPoints, tabIndex, isMobile, changeHash, ...rest }) {
  const itineraryTabs = planEdges.map((edge, i) => {
    // From xtpPoints extract only those "infos" where edge_index equals i
    const xtp_edge_points = xtpPoints.filter(p => p.edge_index === i);
    return (
      <div
        className={`swipeable-tab ${tabIndex !== i && 'inactive'}`}
        key={`itinerary-${i}`}
        aria-hidden={tabIndex !== i}
      >
        <ItineraryDetails
          itinerary={edge.node}
          xtpEdgePoints={xtp_edge_points}
          hideTitle={!isMobile}
          changeHash={isMobile ? changeHash : undefined}
          isMobile={isMobile}
          {...rest}
        />
      </div>
    );
  });

  return (
    <SwipeableTabs
      tabs={itineraryTabs}
      tabIndex={tabIndex}
      onSwipe={changeHash}
      classname={isMobile ? 'swipe-mobile-divider' : 'swipe-desktop-view'}
      ariaFrom="swipe-summary-page"
      ariaFromHeader="swipe-summary-page-header"
    />
  );
}

ItineraryTabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  xtpPoints: PropTypes.arrayOf(xtpShape),
  changeHash: PropTypes.func,
};

ItineraryTabs.defaultProps = {
  changeHash: undefined,
  xtpPoints: [],
};

export default ItineraryTabs;
