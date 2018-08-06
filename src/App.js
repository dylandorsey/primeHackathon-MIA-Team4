import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import Header from './components/Header/Header';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import ScheduleView from './components/ScheduleView/ScheduleView';

import MapView from './components/MapView/MapView';

import './calendar.css'

const App = () => (
  <div>
    {/* <Header className="header"/> */}
    <Router>
      <Switch>
        <Redirect exact from="/" to="/home" />
        <Route
          path="/home"
          component={LoginPage}
        />
        <Route
          path="/register"
          component={RegisterPage}
        />
        <Route
          path="/schedule"
          component={ScheduleView}
        />
        <Route
          path="/map"
          component={MapView}
        />
        {/* OTHERWISE no path */}
        <Route
          render={() => <h1>404</h1>}
        />
      </Switch>
    </Router>
  </div>
);

export default App;
