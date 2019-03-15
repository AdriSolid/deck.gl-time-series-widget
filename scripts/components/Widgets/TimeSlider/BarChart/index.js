import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { dateField } from '../../../../config/config';
import './style.scss';


export default class BarChart extends Component {

    static propTypes = {
      memory: PropTypes.array.isRequired
    }  

    constructor(props) {
        super(props);
    
        this.state = {
            data: [],
            popupState: 'none',
            popupCountInnerHTML: '',
            popupDateInnerHTML: ''
        };
    }

    componentWillReceiveProps = nextProps => {
      const { memory } = this.props;

      if (nextProps.memory !== memory) {
        let chartCount = nextProps.memory.reduce((ar, obj) => {
          let bool = false;
          if (!ar) {
            ar = [];
          }
          ar.forEach(a => {
            if (a[dateField] === obj[dateField]) {
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

        let target = chartCount.map(v => v.count);
        let dates = chartCount.map(v => v[dateField]);
        let totalValues = target.reduce((v, i) => v + i);
        let standardize = chartCount.map(v => (v.count * 100) / totalValues);
        let maxHeight = 80;
      
        this.setState({ data: standardize.map(v => new Array((v * maxHeight) / 80, target, dates)) });
      }
    }

    _renderTooltip = (e, count, date) => { 
      this.setState({ 
        popupState: 'show', 
        popupCountInnerHTML: count,
        popupDateInnerHTML: date
      });
    }

    _hideTooltip = () => this.setState({ popupState: 'none' });

    _numberWithDots = str => str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    render() {
        const { data, 
                popupState, 
                popupCountInnerHTML,
                popupDateInnerHTML} = this.state;

        return (
            <div className="container">
              <div className={`chart-tooltip ${popupState}`} style={{ position: 'absolute', left: '4px' , bottom: '4px' }}>
                <div>
                  <b>{this._numberWithDots(popupCountInnerHTML)}</b>meteorites
                </div>
                <div>
                  year<b>{popupDateInnerHTML}</b>
                </div>
              </div>
              <svg width="100%" height="80">
                {data && (data.map((f, i) => [
                   <rect 
                     key={`colored-${i}`}
                     className="colored"
                     onMouseMove={(e) => this._renderTooltip(e, f[1][i], f[2][i])}
                     onMouseOut={this._hideTooltip}
                     height={f[0]} 
                     fill={'#ff9933'}
                     style={{ width: `calc(95% / ${f[1].length})`, 
                              x: `calc(calc(100% / ${f[1].length}) * ${i})` }} 
                              y={'-80px'}>
                   </rect>,
                   <rect
                     key={`non-colored-${i}`}
                     className="non-colored"
                     onMouseMove={(e) => this._renderTooltip(e, f[1][i], f[2][i])}
                     onMouseOut={this._hideTooltip}
                     height={'70'} 
                     fill={'transparent'}
                     style={{ width: `calc(95% / ${f[1].length})`, 
                              x: `calc(calc(100% / ${f[1].length}) * ${i})` }} 
                              y={'-81px'}>
                  </rect>
                 ]))}
              </svg> 
            </div> 
        );
    }
}