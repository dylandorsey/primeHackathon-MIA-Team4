import { combineReducers } from 'redux';
import { MAP_ACTIONS } from '../actions/mapActions';

const mapData = (state = [], action) => {
  switch (action.type) {
    case MAP_ACTIONS.SET_DATA:

      //End of logic for marker to display per photog

      return action.payload;
    default:
      return state;
  }
};

//Mileage table logic to only show each photog only once with the marker img and add all the travel distance/mileages of that photog together
const milesViewData = (state = [], action) => {
  console.log('---------ACTIONNNNNN', action)
  switch (action.type) {
    case MAP_ACTIONS.SET_MILES_VIEW_DATA:

      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  mapData,
  milesViewData,
});