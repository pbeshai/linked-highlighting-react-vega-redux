import * as types from '../constants/ActionTypes';

export function setChartData(data) {
  return { type: types.SET_CHART_DATA, data };
}

export function highlightChart(point) {
  return { type: types.HIGHLIGHT_CHART, point };
}
