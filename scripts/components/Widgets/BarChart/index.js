import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DATE_FIELD } from '../../../config/config';
import './style.scss';

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
      let chartCount = nextProps.memory.reduce((ar, obj) => {
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
      const totalValues = target.reduce((v, i) => v + i);
      const standardize = chartCount.map(v => (v.count * 100) / totalValues);
      const maxHeight = 80;
      const data = standardize.map(v => new Array((v * maxHeight) / 80, target, dates));

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
        <svg className="bar-chart-svg" width="100%" height="80">
          {data &&
            data.map((f, i) => [
              <rect
                key={`colored-${i}`}
                className="bar-chart-svg-colored"
                onMouseMove={e => this._renderTooltip(e, f[1][i], f[2][i])}
                onMouseOut={this._hideTooltip}
                height={f[0]}
                fill={'#ff9933'}
                style={{
                  width: `calc(95% / ${f[1].length})`,
                  x: `calc(calc(100% / ${f[1].length}) * ${i})`
                }}
                y={'-80px'}
              />,
              <rect
                key={`non-colored-${i}`}
                className="bar-chart-svg-non-colored"
                onMouseMove={e => this._renderTooltip(e, f[1][i], f[2][i])}
                onMouseOut={this._hideTooltip}
                height={'70'}
                fill={'transparent'}
                style={{
                  width: `calc(95% / ${f[1].length})`,
                  x: `calc(calc(100% / ${f[1].length}) * ${i})`
                }}
                y={'-80px'}
              />
            ])}
        </svg>
      </div>
    );
  }
}
