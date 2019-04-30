import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { animationResponse } from '../../../actions/animation';
import PropTypes from 'prop-types';
import Slider from '@material-ui/lab/Slider';
import iconImg from './img/icon.png';
import BarChart from '../BarChart';
import './style.scss';

class TimeSlider extends Component {
  static propTypes = {
    memory: PropTypes.array.isRequired,
    dateUniques: PropTypes.array.isRequired
  };

  state = {
    memory: [],
    currentDay: null,
    hideContainer: '',
    value: 0,
    maxValue: 100,
    sliderDuration: 200,
    intervalSetter: null,
    isPlaying: false,
    playOrPause: 'play',
    speedButtonActive: 'speed-button-active',
    halfSpeedEnabled: false,
    regularSpeedEnabled: true,
    doubleSpeedEnabled: false
  };

  componentWillUnmount = () => {
    clearInterval(this.state.intervalSetter);
  };

  componentWillReceiveProps = nextProps => {
    const { memory, dateUniques } = this.props;

    if (nextProps.memory !== memory) {
      this.setState({ memory: nextProps.memory });
    }

    if (nextProps.dateUniques !== dateUniques) {
      let toSplitIn = 8;
      let interval = nextProps.dateUniques.length / toSplitIn;
      let target = [];

      for (let i = 0; i < toSplitIn; i++) {
        target.push(nextProps.dateUniques[Math.round(interval * i)]);
      }

      this.setState({
        maxValue: nextProps.dateUniques.length,
        currentDay: nextProps.dateUniques.length > 10 ? target : nextProps.dateUniques
      });
    }
  };

  _handleSliderChange = (t, newValue) => {
    const { maxValue } = this.state;

    this.setState({ value: newValue });
    this.props.animationResponse('animation-value', [newValue, maxValue]);
  };

  _animate = () => {
    const { value, maxValue } = this.state;

    if (value <= maxValue) {
      this.setState(
        {
          value: parseInt(value) + 1,
          isPlaying: true
        },
        () => {
          this.props.animationResponse('animation-value', [value, maxValue]);
        }
      );
    }

    if (value == maxValue) {
      this._handlePause();
    }
  };

  _handleAnimation = () => {
    const { playOrPause } = this.state;

    playOrPause == 'play' ? this._handlePlay() : this._handlePause();
  };

  _handlePlay = () => {
    const { sliderDuration } = this.state;

    let intervalId = setInterval(this._animate, sliderDuration);
    this.setState({
      intervalSetter: intervalId,
      playOrPause: 'pause'
    });
  };

  _handlePause = () => {
    const { intervalSetter } = this.state;

    clearInterval(intervalSetter);
    this.setState({ isPlaying: false, playOrPause: 'play' });
  };

  _resetSlider = () => this.setState({ value: 0 });

  _speed = type => {
    if (type == 'half') {
      this.setState(
        {
          sliderDuration: 400,
          halfSpeedEnabled: true,
          regularSpeedEnabled: false,
          doubleSpeedEnabled: false
        },
        () => {
          this._handlePause();
          this._handlePlay();
        }
      );
    } else if (type == 'regular') {
      this.setState(
        {
          sliderDuration: 200,
          halfSpeedEnabled: false,
          regularSpeedEnabled: true,
          doubleSpeedEnabled: false
        },
        () => {
          this._handlePause();
          this._handlePlay();
        }
      );
    } else if (type == 'double') {
      this.setState(
        {
          sliderDuration: 100,
          halfSpeedEnabled: false,
          regularSpeedEnabled: false,
          doubleSpeedEnabled: true
        },
        () => {
          this._handlePause();
          this._handlePlay();
        }
      );
    }
  };

  _containerVisibility = () => {
    const { hideContainer } = this.state;

    this.setState({
      hideContainer: hideContainer == 'none' ? '' : 'none'
    });
  };

  render() {
    const {
      memory,
      currentDay,
      hideContainer,
      value,
      maxValue,
      playOrPause,
      halfSpeedEnabled,
      regularSpeedEnabled,
      doubleSpeedEnabled,
      speedButtonActive
    } = this.state;

    return (
      <div>
        <div className="time-slider-widget-button" onClick={this._containerVisibility}>
          <img src={iconImg} alt="Time-slider Widget icon" />
        </div>

        <div className={`widget-container ${hideContainer}`}>
          <div className="flex-column">
            <div className="flex-row labels-container">
              <div>Reactive meteorites</div>
              <div className="speed-buttons-container">
                <div
                  className={halfSpeedEnabled ? speedButtonActive : ''}
                  onClick={() => this._speed('half')}
                >
                  0.5x
                </div>
                <div
                  className={regularSpeedEnabled ? speedButtonActive : ''}
                  onClick={() => this._speed('regular')}
                >
                  1x
                </div>
                <div
                  className={doubleSpeedEnabled ? speedButtonActive : ''}
                  onClick={() => this._speed('double')}
                >
                  2x
                </div>
              </div>
            </div>

            <div className="flex-row">
              <div className="buttons-container flex-row">
                <div className="main-button" onClick={this._resetSlider}>
                  <i className="icon undo" />
                </div>
                <div className="main-button" onClick={this._handleAnimation}>
                  <i className={`icon ${playOrPause}`} />
                </div>
              </div>

              <div className="flex-column">
                <div className="barChart-container">
                  <BarChart memory={memory} />
                </div>
                <div>
                  <Slider
                    className="slider-control"
                    value={value}
                    aria-labelledby="label"
                    onChange={this._handleSliderChange}
                    min={0}
                    max={maxValue}
                    step={1}
                  />
                </div>
                <div className="slider-labels-container">
                  {currentDay && currentDay.map((f, i) => <div key={`label-${i}`}>{f}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const matchDispatchToProps = dispatch =>
  bindActionCreators({ animationResponse: animationResponse }, dispatch);

export default connect(
  null,
  matchDispatchToProps
)(TimeSlider);
