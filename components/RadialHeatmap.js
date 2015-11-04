import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import vg from 'vega';

class RadialHeatmap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vis: null
    };

    // use PureRenderMixin to limit updates when they are not necessary
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this._handleHover = this._handleHover.bind(this);
  }

  // On initial load, generate the initial vis and attach signal listeners
  componentDidMount() {
    const { data, highlightedPoint } = this.props;
    const spec = this._spec();

    // parse the vega spec and create the vis
    vg.parse.spec(spec, chart => {
      const vis = chart({ el: this.refs.chartContainer })
        .onSignal('hover', (_, datum) => this._handleHover(datum));

      // set the initial data
      vis.data('points').insert(data);

      // set the initial highlighted point if available
      if (highlightedPoint) {
        vis.data('highlightedPoint').insert([highlightedPoint]);
      }

      // render the vis
      vis.update();

      // store the vis object in state to be used on later updates
      this.setState({ vis });
    });
  }

  componentDidUpdate() {
    const { vis } = this.state;
    const { data, highlightedPoint } = this.props;

    if (vis) {
      // update data in case it changed
      vis.data('points').remove(() => true).insert(data);

      // update the highlighted point in case it changed
      vis.data('highlightedPoint').remove(() => true);
      if (highlightedPoint) {
        vis.data('highlightedPoint').insert([highlightedPoint]); // note the array seems to be required
      }

      vis.update();
    }
  }

  // dummy render method that creates the container vega draws inside
  render() {
    return (
      <div ref='chartContainer'></div>
    );
  }

  // callback when the hover signal changes
  _handleHover(datum) {
    const { onHighlight } = this.props;
    if (onHighlight) {
      onHighlight(datum);
    }
  }

  // the vega spec
  _spec() {
    const numCircles = 31; // should be determined from data.length, but this is sufficient for now.
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
          // From the vega-scenegraph source code: r = sqrt(size / Math.PI) ==> size = r^2 * Math.PI.
          'range': [strokeWidth * Math.PI, Math.pow((width - strokeWidth) / 2, 2) * Math.PI]
        },
        {
          'name': 'color',
          'type': 'linear',
          'domain': {'data': 'points', 'field': 'value'},
          'range': ['#edf8b1', '#2c7fb8']
        }
      ],
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
              'strokeWidth': {'value': strokeWidth},
              'fill': {'value': null},
              'size': {'scale': 'r', 'field': 'distance'}
            }
          }
        },
        {
          'type': 'symbol',
          'from': {'data': 'highlightedPoint'},
          'interactive': false,
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
