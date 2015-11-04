import * as types from '../constants/ActionTypes';

// sets all the data points for the charts
export function setChartData(data) {
  return { type: types.SET_CHART_DATA, data };
}

// sets the highlighted datum for the charts
export function highlightChart(point) {
  return { type: types.HIGHLIGHT_CHART, point };
}
