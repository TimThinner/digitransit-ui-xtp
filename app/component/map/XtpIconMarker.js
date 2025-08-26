import PropTypes from 'prop-types';
import React from 'react';
import { createPortal } from 'react-dom';
import { default as L } from 'leaflet';
import Marker from 'react-leaflet/es/Marker';

/* eslint-disable no-underscore-dangle */
export default class XtpIconMarker extends React.Component {
  constructor(props, ...args) {
    super(props, ...args);
    const _this = this;
    //this.markerRef = React.createRef();
    //this.handleClickMarker = this.handleClickMarker.bind(this);
    this.Icon = L.Icon.extend({
      options: {
        // @section
        // @aka DivIcon options
        iconSize: [12, 12], // also can be set through CSS
        // iconAnchor: (Point),
        // popupAnchor: (Point),
        // @option html: String = ''
        // Custom HTML code to put inside the div element, empty by default.
        element: false,
        className: 'leaflet-div-icon',
      },
      createIcon(oldIcon) {
        const div =
          oldIcon && oldIcon.tagName === 'DIV'
            ? oldIcon
            : document.createElement('div');
        _this.setState({ div });
        this._setIconStyles(div, 'icon');
        return div;
      },
      createShadow() {
        return null;
      },
    });
    this.state = { icon: new this.Icon(props.icon) };
  }
  /*
  handleClickMarker() {
    console.log(['HELLO! this.markerRef=',this.markerRef]);
    const popup = this.markerRef.current.getPopup();
    if (popup) {
      this.markerRef.current.closePopup();
      this.markerRef.current.unbindPopup(); 
    }
    this.markerRef.current.bindPopup("<strong>Hello world!</strong><br />I am a popup.", {maxWidth: 500}).openPopup();
  }
  */
  componentDidUpdate() {
    this.state.icon.initialize(this.props.icon);
  }

  render() {
    console.log(['this.props.children=',this.props.children]);
    return [
      this.state.div &&
        createPortal(this.props.icon.element, this.state.div, 'icon'),
      <Marker
        key="marker"
        {...this.props}
        icon={this.state.icon}
        keyboard={false}
        zIndexOffset={this.props.zIndexOffset}
      >
        {this.props.children}
      </Marker>,
    ];
  }
}

XtpIconMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  icon: PropTypes.shape({
    element: PropTypes.node.isRequired,
  }).isRequired,
  zIndexOffset: PropTypes.number,
  children: PropTypes.node,
  //onClickMarker: PropTypes.func,
};

XtpIconMarker.defaultProps = {
  zIndexOffset: undefined,
  children: undefined,
  //onClickMarker: undefined,
};
