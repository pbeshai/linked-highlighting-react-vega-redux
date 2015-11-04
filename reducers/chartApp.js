import { SET_CHART_DATA, HIGHLIGHT_CHART } from '../constants/ActionTypes';

const initialState = {
  chartData: [],
  highlightedPoint: null
};

// update application state based on action type and parameters
export default function chartAppReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CHART_DATA:
      return Object.assign({}, state, { chartData: action.data });

    case HIGHLIGHT_CHART:
      return Object.assign({}, state, { highlightedPoint: action.point });

    default:
      return state;
  }
}
