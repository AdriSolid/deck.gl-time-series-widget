import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { DATE_FIELD, MASS_FIELD } from '../../../config/config';
import './style.scss';

const maxHeight = 70;

export default class BarChart extends Component {
  static propTypes = {
    memory: PropTypes.array.isRequired
  };

  state = {
    data: [],
    popupState: 'bar-chart-tooltip--close',
    popupCountInnerHTML: '',
    popupDateInnerHTML: ''
  };

  componentWillReceiveProps = nextProps => {
    const { memory } = this.props;

    if (nextProps.memory !== memory) {
      const chartCount = nextProps.memory.reduce((ar, obj) => {
        let bool = false;
        if (!ar) {
          ar = [];
        }
        ar.forEach(a => {
          if (a[DATE_FIELD] === obj[DATE_FIELD]) {
            a.count++;
            bool = true;
          }
        });
        if (!bool) {
          obj.count = 1;
          ar.push(obj);
        }
        return ar;
      }, []);

      const target = chartCount.map(v => v.count);
      const dates = chartCount.map(v => v[DATE_FIELD]);

      const maxValue = Math.max(...target);
      const data = target.map(v => new Array((maxHeight * v) / maxValue, target, dates));

      this.setState({ data: data });
    }
  };

  _renderTooltip = (e, count, date) => {
    this.setState({
      popupState: 'bar-chart-tooltip--open',
      popupCountInnerHTML: count,
      popupDateInnerHTML: date
    });
  };

  _hideTooltip = () => {
    this.setState({ popupState: 'bar-chart-tooltip--close' });
  };

  _numberWithDots = v => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  _rectStyle = (feature, index) => ({
    width: `calc(95% / ${feature[1].length})`,
    x: `calc(calc(100% / ${feature[1].length}) * ${index})`,
    y: -(maxHeight + 10)
  });

  render() {
    const { data, popupState, popupCountInnerHTML, popupDateInnerHTML } = this.state;

    return (
      <div className="bar-chart">
        <div
          className={`bar-chart-tooltip ${popupState}`}
          style={{ position: 'absolute', left: '4px', bottom: '4px' }}
        >
          <div>
            <b>{this._numberWithDots(popupCountInnerHTML)}</b>meteorites
          </div>
          <div>
            year<b>{popupDateInnerHTML}</b>
          </div>
        </div>
        <svg className="bar-chart-svg" width="100%" height={maxHeight + 10}>
          {data &&
            data.map((f, i) => (
              <Fragment key={`rect-${i}`}>
                <rect
                  key={`colored-${i}`}
                  className="bar-chart-svg-colored"
                  onMouseMove={e => this._renderTooltip(e, f[1][i], f[2][i])}
                  onMouseOut={this._hideTooltip}
                  height={f[0]}
                  fill={'#ff9933'}
                  style={this._rectStyle(f, i)}
                />
                <rect
                  key={`non-colored-${i}`}
                  className="bar-chart-svg-non-colored"
                  onMouseMove={e => this._renderTooltip(e, f[1][i], f[2][i])}
                  onMouseOut={this._hideTooltip}
                  height={maxHeight}
                  fill={'transparent'}
                  style={this._rectStyle(f, i)}
                />
              </Fragment>
            ))}
        </svg>
      </div>
    );
  }
}
