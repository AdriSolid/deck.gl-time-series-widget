import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactMapGL from 'react-map-gl';
import Deck, { ScatterplotLayer } from 'deck.gl';
import { isWebGL2 } from 'luma.gl';
import TimeSlider from '../Widgets/TimeSlider';
import axios from 'axios';
import * as config from '../../config/config';
import './style.scss';

class Main extends Component {

  static propTypes = {
    animationValue: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
  }

  state = {
    basemap: config.basemap,
    viewState: config.viewState,
    data: [],
    memory: [],
    uniques_date: []
  };

  componentWillMount = () => {
    axios.get(config.data)
      .then(response => {
        let target = response.data.sort((a, b) => a[config.dateField] - b[config.dateField]);
        this.setState({
          data: target,
          memory: target,
          uniques_date: target.map(item => item[config.dateField])
            .filter((value, index, self) => self.indexOf(value) === index).sort()
        });
      })
      .catch(err => {
        throw err
      });
  }

  componentWillReceiveProps = nextProps => {
    const { memory } = this.state;
    const { animationValue } = this.props;

    if (nextProps.animationValue !== animationValue) {
      let sliderValue = nextProps.animationValue;
      let total = memory.length;
      let featuresPerInterval = total / sliderValue[1];
      let toShow = sliderValue[0] * featuresPerInterval;
      this.setState({
        data: memory.filter((f, i) => i < toShow)
      })
    }
  }

  _onViewStateChange = ({ viewState }) => {
    this.setState({ viewState });
  }

  _renderUnidadesTooltip() {
    const { hoveredObject, pointerX, pointerY } = this.state || {};
    return hoveredObject && (
      <div className="tooltip" style={{ left: pointerX, top: pointerY }}>
          <div><b>{hoveredObject[config.nameField]}</b></div>
          <div>mass:<b>{hoveredObject[config.massField]}</b></div>
      </div>
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
          if (d[config.massField] < config.size.small) {
            return 1;
          } else if (d[config.massField] < config.size.medium) {
            return 2;
          } else if (d[config.massField] < config.size.big) {
            return 3;
          } else {
            return 5;
          }
        },
        getFillColor: d => {
          if (d[config.massField] < config.size.small) {
            return config.massColors[0];
          } else if (d[config.massField] < config.size.medium) {
            return config.massColors[1];
          } else if (d[config.massField] < config.size.big) {
            return config.massColors[2];
          } else {
            return config.massColors[3];
          }
        },
        radiusScale: d => 2 ** (18 - viewState.zoom),
        onHover: info => this.setState({
          hoveredObject: info.object,
          pointerX: info.x,
          pointerY: info.y
        })
      })
    ];
  }

  _onInitialized(gl) {
    if (!isWebGL2(gl)) {
      console.warn('GPU aggregation is not supported');
      if (this.props.disableGPUAggregation) {
        this.props.disableGPUAggregation();
      }
    }
  }

  render() {
    const { viewState, memory, uniques_date } = this.state;
    const { controller = true, baseMap = true } = this.props;

    return (
      <div>
        <Deck
          width={'100%'}
          height={'100%'}
          onWebGLInitialized={this._onInitialized}
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
              mapboxApiAccessToken={config.mapboxToken}
            ></ReactMapGL>
          )}
          {this._renderUnidadesTooltip()}
        </Deck>

        <TimeSlider memory={memory} dateUniques={uniques_date}></TimeSlider>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    animationValue: state.animationPlayingReducer.value
  }
}

export default connect(mapStateToProps)(Main);  