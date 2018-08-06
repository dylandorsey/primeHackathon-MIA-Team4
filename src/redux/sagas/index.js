import { all } from 'redux-saga/effects';
import userSaga from './userSaga';
import loginSaga from './loginSaga';
import scheduleSaga from './scheduleSaga';
import mapSaga from './mapSaga';


export default function* rootSaga() {
  yield all([
    userSaga(),
    loginSaga(),
    scheduleSaga(),
    mapSaga(),
    // watchIncrementAsync()
  ]);
}
