import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import vg from 'vega';

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vis: null
    };

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this._handleMouseMove = this._handleMouseMove.bind(this);
  }

  componentDidMount() {
    const { data, highlightedPoint } = this.props;
    const spec = this._spec();

    vg.parse.spec(spec, chart => {
      let vis = chart({ el: this.refs.chartContainer })
        .onSignal('mouse', (_, mouse) => this._handleMouseMove(mouse));

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

  /**
   * x = domain x
   * y = domain y
   */
  _handleMouseMove({ x, y }) {
    const { onHighlight, data } = this.props;

    // we only care if onHighlight exists
    if (!onHighlight) {
      return;
    }

    if (x == null || y == null) {
      onHighlight(null);
    } else {
      const nearestPoint = this._findClosest(data, x);
      onHighlight(nearestPoint);
    }
  }

  // simple way to find the closest element by x coordinate
  _findClosest(data, x) {
    let closest = null;
    let closestDist = null;

    for (let elem of data) {
      const dist = Math.abs(elem.distance - x);
      if (closestDist == null || dist < closestDist) {
        closestDist = dist;
        closest = elem;
      }
    }

    return closest;
  }

  _spec() {
    return {
      'width': 400,
      'height': 400,
      'padding': { 'top': 10, 'left': 50, 'bottom': 50, right: 10 },
      'signals': [
        {
          'name': 'mouseX',
          'init': null,
          'streams': [
            {
              'type': 'mousemove',
              'expr': 'clamp(eventX(), 0, eventGroup("root").width)',
              'scale': {'name': 'x', 'invert': true }
            }, {
              'type': 'mouseout',
              'expr': 'null'
            }
          ]
        }, {
          'name': 'mouseY',
          'init': null,
          'streams': [
            {
              'type': 'mousemove',
              'expr': 'clamp(eventY(), 0, eventGroup("root").width)',
              'scale': {'name': 'y', 'invert': true }
            }, {
              'type': 'mouseout',
              'expr': 'null'
            }
          ]
        }, {
          'name': 'mouse',
          'init': null,
          'expr': '{ x: mouseX, y: mouseY }'
        }
      ],
      'data': [{'name': 'points'}, {'name': 'highlightedPoint'}],
      'scales': [
        {
          'name': 'x',
          'type': 'linear',
          'domain': {'data': 'points', 'field': 'distance'},
          'range': 'width'
        },
        {
          'name': 'y',
          'type': 'linear',
          'domain': {'data': 'points', 'field': 'value'},
          'range': 'height',
          'nice': true
        }
      ],
      'axes': [
        {
          'type': 'x',
          'scale': 'x',
          'offset': 5,
          'ticks': 5,
          'title': 'Distance',
          'layer': 'back'
        },
        {
          'type': 'y',
          'scale': 'y',
          'offset': 5,
          'ticks': 5,
          'title': 'Value',
          'layer': 'back'
        }
      ],
      'marks': [
        {
          'type': 'line',
          'from': {'data': 'points'},
          'properties': {
            'enter': {
              'x': {'scale': 'x', 'field': 'distance'},
              'y': {'scale': 'y', 'field': 'value'},
              'stroke': {'value': '#5357a1'},
              'strokeWidth': {'value': 2}
            }
          }
        },
        {
          'type': 'symbol',
          'from': {'data': 'highlightedPoint'},
          'properties': {
            'enter': {
              'x': {'scale': 'x', 'field': 'distance'},
              'y': {'scale': 'y', 'field': 'value'},
              'fill': {'value': '#fa7f9f'},
              'stroke': {'value': '#891836'},
              'strokeWidth': {'value': 1},
              'size': {'value': 64}
            }
          }
        }
      ]
    };
  }
}

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  onHighlight: PropTypes.func,
  highlightedPoint: PropTypes.object
};

export default LineChart;
