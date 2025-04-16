import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legShape } from '../../util/shapes';

import TransitLeg from './TransitLeg';

const AirplaneLeg = ({ leg, focusAction, index, xtp_leg_icon }) => (
  <TransitLeg
    mode="AIRPLANE"
    leg={leg}
    focusAction={focusAction}
    index={index}
    xtp_leg_icon={xtp_leg_icon}
    omitDivider
  >
    <FormattedMessage
      id="airplane-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
      }}
      defaultMessage="Flight {routeNumber}"
    />
  </TransitLeg>
);

AirplaneLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  xtp_leg_icon: PropTypes.bool,
  focusAction: PropTypes.func.isRequired,
};

AirplaneLeg.defaultProps = {
  xtp_leg_icon: false,
};

export default AirplaneLeg;
