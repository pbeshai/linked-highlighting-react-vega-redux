import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import vg from 'vega';

class RadialHeatmap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vis: null
    };

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this._handleHover = this._handleHover.bind(this);
  }

  componentDidMount() {
    const { data, highlightedPoint } = this.props;
    const spec = this._spec();

    vg.parse.spec(spec, chart => {
      let vis = chart({ el: this.refs.chartContainer })
        .onSignal('hover', (_, datum) => this._handleHover(datum));

      vis.data('points').insert(data);
      if (highlightedPoint) {
        vis.data('highlightedPoint').insert([highlightedPoint]);
      }
      vis.update();

      this.setState({ vis });
    });
  }

  componentDidUpdate() {
    const { vis } = this.state;
    const { data, highlightedPoint } = this.props;

    if (vis) {
      vis.data('points').remove(() => true).insert(data);
      vis.data('highlightedPoint').remove(() => true);
      if (highlightedPoint) {
        vis.data('highlightedPoint').insert([highlightedPoint]);
      }
      vis.update();
    }
  }

  render() {
    return (
      <div ref='chartContainer'></div>
    );
  }

  _handleHover(datum) {
    const { onHighlight } = this.props;
    if (onHighlight) {
      onHighlight(datum);
    }
  }

  _spec() {
    const numCircles = 31; // should be determined from data.length
    const width = 450, height = width / 2 + 1, strokeWidth = (width / numCircles) / 2;

    return {
      'width': width,
      'height': height,
      'padding': { 'top': 0, 'left': 0, 'bottom': 0, 'right': 0 },
      'signals': [
        {
          'name': 'hover', 'init': null,
          'streams': [
            {'type': '@ring:mouseover', 'expr': 'datum'},
            {'type': '@ring:mouseout', 'expr': 'null'}
          ]
        }
      ],
      'data': [{'name': 'points'}, {'name': 'highlightedPoint'}],
      'scales': [
        {
          'name': 'r',
          'type': 'pow',
          'domain': {'data': 'points', 'field': 'distance'},
          'exponent': 2,
          'range': [strokeWidth * Math.PI, Math.pow((width - strokeWidth) / 2, 2) * Math.PI] // r = sqrt(size / Math.PI) ==> size = r^2 * Math.PI. Max = (width/2)^2 * Math.PI
        },
        {
          'name': 'color',
          'type': 'linear',
          'domain': {'data': 'points', 'field': 'value'},
          'range': ['#edf8b1', '#2c7fb8']
        }
      ],
      // 'predicates': [
      //   {
      //     'name': 'isHighlighted',
      //     'type': 'in',
      //     'item': {'arg': 'id'},
      //     'data': 'highlightedPoint',
      //     'field': '_id'
      //   }
      // ],
      'marks': [
        {
          'type': 'symbol',
          'name': 'ring',
          'from': {'data': 'points'},
          'properties': {
            'enter': {
              'shape': 'circle',
              'x': {'value': width / 2},
              'y': {'value': 0},
              'stroke': {'scale': 'color', 'field': 'value'},
              // 'stroke': {
              //   'rule': [
              //     {
              //       'predicate': {
              //         'name': 'isHighlighted',
              //         'id': {'field': '_id'}
              //       },
              //       'value': 'blue'
              //     },
              //     {'scale': 'color', 'field': 'value'}
              //   ],
              // },
              'strokeWidth': {'value': strokeWidth},
              'fill': {'value': null},
              'size': {'scale': 'r', 'field': 'distance'}
            }
          }
        },
        {
          'type': 'symbol',
          'from': {'data': 'highlightedPoint'},
          'properties': {
            'enter': {
              'x': {'value': width / 2},
              'y': {'value': 0},
              'stroke': { 'value': '#FA7F9F' },
              'strokeWidth': {'value': strokeWidth},
              'fill': {'value': null},

              'size': {'scale': 'r', 'field': 'distance'}
            }
          }
        }
      ]
    };
  }
}

RadialHeatmap.propTypes = {
  data: PropTypes.array.isRequired,
  onHighlight: PropTypes.func,
  highlightedPoint: PropTypes.object
};

export default RadialHeatmap;
