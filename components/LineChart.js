import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import vg from 'vega';

class LineChart extends Component {
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
        .onSignal('hover', this._handleHover);

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

  // updates mean that either the data or the highlightedPoint changed
  componentDidUpdate() {
    const { vis } = this.state;
    const { data, highlightedPoint } = this.props;

    if (vis) {
      // update data in case it changed
      vis.data('points').remove(() => true).insert(data);

      // update the highlighted point in case it changed
      vis.data('highlightedPoint').remove(() => true);
      if (highlightedPoint) {
        vis.data('highlightedPoint').insert([highlightedPoint]);
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

  /**
   * handler called when the hover signal changes
   */
  _handleHover(signalName, d) {
    const { onHighlight } = this.props;

    // we only care if onHighlight exists
    if (!onHighlight) {
      return;
    }

    if (d) {
      onHighlight(d.datum);
    } else {
      onHighlight(null);
    }
  }

  // the vega spec for the chart
  _spec() {
    return {
      'width': 400,
      'height': 400,
      'padding': { 'top': 10, 'left': 50, 'bottom': 50, right: 10 },
      'signals': [
        {
          'name': 'hover', 'init': null,
          'streams': [
            { 'type': '@cell:mouseover', 'expr': 'datum' },
            { 'type': '@cell:mouseout', 'expr': 'null' }
          ]
        }
      ],
      'data': [{ 'name': 'points' }, { 'name': 'highlightedPoint' }],
      'scales': [
        {
          'name': 'x',
          'type': 'linear',
          'domain': { 'data': 'points', 'field': 'distance' },
          'range': 'width'
        },
        {
          'name': 'y',
          'type': 'linear',
          'domain': { 'data': 'points', 'field': 'value' },
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
          'from': { 'data': 'points' },
          'interactive': false, // <-- to prevent interaction with the mouse, so the voronoi cells get it all
          'properties': {
            'enter': {
              'x': { 'scale': 'x', 'field': 'distance' },
              'y': { 'scale': 'y', 'field': 'value' },
              'stroke': { 'value': '#5357a1' },
              'strokeWidth': { 'value': 2 }
            }
          }
        },
        {
          'type': 'path',
          'name': 'cell',
          'from': {
            'mark': 'points',
            'transform': [
              { 'type': 'voronoi', 'x': 'x', 'y': 'y' }
            ]
          },
          'properties': {
            'update': {
              'path': { 'field': 'layout_path' },
              'stroke': { 'value': null},
              'fill': { 'value': 'rgba(0,0,0,0)' }
            }
          }
        },
        {
          'type': 'symbol',
          'from': { 'data': 'highlightedPoint' },
          'interactive': false, // <-- to prevent interaction with the mouse to prevent flickering
          'properties': {
            'enter': {
              'x': { 'scale': 'x', 'field': 'distance' },
              'y': { 'scale': 'y', 'field': 'value' },
              'fill': { 'value': '#fa7f9f' },
              'stroke': { 'value': '#891836' },
              'strokeWidth': { 'value': 1 },
              'size': { 'value': 64 }
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
