import { combineReducers } from 'redux';
import moment from 'moment';
import { SCHEDULE_ACTIONS } from '../actions/scheduleActions';

// const tomorrow = moment(new Date()).add(1, "day").toDate();
const demoDate = moment(new Date(2021,6,11,0,0,0,0)).toDate();

const currentDate = (state = demoDate, action) => {
  switch (action.type) {
    case SCHEDULE_ACTIONS.SET_CURRENT_DATE:
      return action.payload;
    default:
      console.log('currentDate reducer is returning default case.');
      return state;
  }
}

const currentDriveTime = (state = 35, action) => {
  switch (action.type) {
    case SCHEDULE_ACTIONS.SET_CURRENT_DRIVE_TIME:
      console.log('currentDriveTime reducer is returning SET_CURRENT_DRIVE_TIME case with: ' + action.payload);
      return action.payload;
    default:
      console.log('currentDriveTime reducer is returning default case.');
      return state;
  }
};

const currentAppointments = (state = [], action) => {
  switch (action.type) {
    case SCHEDULE_ACTIONS.SET_APPOINTMENTS_FROM_DATABASE:
      console.log('currentAppointments reducer is returning SET_CURRENT_DRIVE_TIME case with: ' + action.payload.length);
      return action.payload;
    case SCHEDULE_ACTIONS.SET_APPOINTMENTS_AFTER_DRAG_AND_DROP:
      console.log('currentAppointments reducer is returning SET_APPOINTMENTS_AFTER_DRAG_AND_DROP with payload:')
      console.log(action.payload);
      return action.payload;
    default:
      console.log('currentAppointments reducer is returning default case.');
      return state;
  }
};

const pageIsLoading = (state = false, action) => {
  switch (action.type) {
    case SCHEDULE_ACTIONS.START_PAGE_IS_LOADING:
    console.log('pageIsLoading recuder received start command.');
      return action.payload
    case SCHEDULE_ACTIONS.END_PAGE_IS_LOADING:
    console.log('pageIsLoading recuder received end command.');
      return action.payload
    default:
      console.log('pageIsLoading reducer is returning default case.')
      return state;
  }
}

const resources = (state = [], action) => {
  switch (action.type) {
    case SCHEDULE_ACTIONS.SET_RESOURCES:
      console.log('resources reducer is returning SET_RESOURCES case with: ' + action.payload)
      return action.payload;
    default:
      console.log('resources reducer is returning default case');
      return state;
  }
};

export default combineReducers({
  currentDate,
  currentDriveTime,
  currentAppointments,
  pageIsLoading,
  resources,
});
