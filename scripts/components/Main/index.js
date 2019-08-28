import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactMapGL from 'react-map-gl';
import DeckGL, { ScatterplotLayer } from 'deck.gl';
import TimeSlider from '../Widgets/TimeSlider';
import axios from 'axios';
import * as config from '../../config/config';

class Main extends Component {
  static propTypes = {
    animationValue: PropTypes.array.isRequired
  };

  state = {
    basemap: config.basemap,
    viewState: config.VIEWSTATE,
    data: [],
    memory: [],
    uniques_date: []
  };

  componentWillMount() {
    axios
      .get(config.DATA)
      .then(response => {
        const target = response.data.sort((a, b) => a[config.DATE_FIELD] - b[config.DATE_FIELD]);
        const date = target
          .map(item => item[config.DATE_FIELD])
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();

        this.setState({
          data: target,
          memory: target,
          uniques_date: date
        });
      })
      .catch(err => {
        throw err;
      });
  }

  componentWillReceiveProps = nextProps => {
    const { memory } = this.state;
    const { animationValue } = this.props;

    if (nextProps.animationValue !== animationValue) {
      const sliderValue = nextProps.animationValue;
      const total = memory.length;
      const featuresPerInterval = total / sliderValue[1];
      const toShow = sliderValue[0] * featuresPerInterval;
      const newData = memory.filter((f, i) => i < toShow);

      this.setState({
        data: newData
      });
    }
  };

  _onViewStateChange = ({ viewState }) => {
    this.setState({ viewState });
  };

  _renderMassTooltip() {
    const { hoveredObject, pointerX, pointerY } = this.state || {};

    return (
      hoveredObject && (
        <div className="tooltip" style={{ left: pointerX, top: pointerY }}>
          <div>
            <b>{hoveredObject[config.NAME_FIELD]}</b>
          </div>
          <div>
            mass:<b>{hoveredObject[config.MASS_FIELD]}</b>
          </div>
        </div>
      )
    );
  }

  _renderLayers() {
    const { viewState, data } = this.state;

    return [
      new ScatterplotLayer({
        id: 'meteorites-layer',
        data: data,
        pickable: true,
        getPosition: d => d.coordinates,
        getRadius: d => {
          if (d[config.MASS_FIELD] < config.SIZE.SMALL) {
            return 1;
          } else if (d[config.MASS_FIELD] < config.SIZE.MEDIUM) {
            return 2;
          } else if (d[config.MASS_FIELD] < config.SIZE.BIG) {
            return 3;
          } else {
            return 5;
          }
        },
        getFillColor: d => {
          if (d[config.MASS_FIELD] < config.SIZE.SMALL) {
            return config.MASS_COLORS[0];
          } else if (d[config.MASS_FIELD] < config.SIZE.MEDIUM) {
            return config.MASS_COLORS[1];
          } else if (d[config.MASS_FIELD] < config.SIZE.BIG) {
            return config.MASS_COLORS[2];
          } else {
            return config.MASS_COLORS[3];
          }
        },
        radiusScale: d => 2 ** (18 - viewState.zoom),
        onHover: info =>
          this.setState({
            hoveredObject: info.object,
            pointerX: info.x,
            pointerY: info.y
          })
      })
    ];
  }

  render() {
    const { viewState, memory, uniques_date } = this.state;
    const { controller = true, baseMap = true } = this.props;

    return (
      <div>
        <DeckGL
          width={'100%'}
          height={'100%'}
          layers={this._renderLayers()}
          viewState={viewState}
          controller={controller}
          onViewStateChange={this._onViewStateChange}
        >
          {baseMap && (
            <ReactMapGL
              reuseMaps
              mapStyle={config.basemap}
              preventStyleDiffing={true}
              doubleClickZoom={false}
              mapboxApiAccessToken={config.MAPBOX_TOKEN}
            />
          )}
          {this._renderMassTooltip()}
        </DeckGL>

        <TimeSlider memory={memory} dateUniques={uniques_date} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    animationValue: state.animationPlayingReducer.value
  };
};

export default connect(mapStateToProps)(Main);
