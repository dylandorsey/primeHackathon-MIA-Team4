import React, {Component} from 'react';
import PropTypes from 'prop-types';
import dates from './utils/dates';
import StatusGrid from './statusGrid';
import { navigate } from './utils/constants';

class Resource extends Component {
  render() {
    let { date, ...props } = this.props;
    let { start, end } = Resource.range(date);

    return (
      <StatusGrid {...props} start={start} end={end} eventOffset={10} />
    );
  }
}

Resource.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired
};

Resource.navigate = (date, action) => {
  switch (action){
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'day');

    case navigate.NEXT:
      return dates.add(date, 1, 'day');

    default:
      return date;
  }
};


Resource.range = (date) => {
  date = dates.startOf(date, 'day');
  return { start: date, end: date };
};


export default Resource;
