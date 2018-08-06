import { combineReducers } from 'redux';
import user from './userReducer';
import login from './loginReducer';
import schedule from './scheduleReducer';
import mapData from './mapReducer';

const store = combineReducers({
  user,
  login,
  schedule,
  mapData,
});

export default store;
