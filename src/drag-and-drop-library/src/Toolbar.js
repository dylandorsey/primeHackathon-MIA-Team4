import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import cn from 'classnames';
import message from './utils/messages';
import { navigate } from './utils/constants';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import { handleClickChangeDate, handleClickSubmit } from '../../Functions/ScheduleFunctions';
import { blue100 } from 'material-ui/styles/colors';
const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 350,
    fontSize: 30,
  },
});


const mapStateToProps = state => ({
  currentAppointments: state.schedule.currentAppointments,
  currentDate: state.schedule.currentDate,
  currentDriveTime: state.schedule.currentDriveTime,
  resources: state.schedule.resources,
  user: state.user,
});


class Toolbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentDate: new Date()
    }
  }

  static propTypes = {
    view: PropTypes.string.isRequired,
    views: PropTypes.arrayOf(
      PropTypes.string,
    ).isRequired,
    label: PropTypes.node.isRequired,
    messages: PropTypes.object,
    onNavigate: PropTypes.func.isRequired,
    onViewChange: PropTypes.func.isRequired,
  }

  // HANDLE INPUT CHANGE
  handleChangeFor = (propertyName) => event => {
    console.log(`init handleChangeFor ${[propertyName]}`);
    console.log('look at this:')
    let newDate = new Date(event.target.value);
    // FIXES BUG WHERE DATE PICKER VALUE RETURNS DATE THAT IS 1 DAY LESS THAN THE SELECTED DAY
    newDate = moment(newDate).add(1, "day").toDate();
    // END FIXES BUG WHERE DATE PICKER VALUE RETURNS DATE THAT IS 1 DAY LESS THAN SELECTED DAY
    this.setState({
      currentDate: newDate
    })
  }
  // END HANDLE INPUT CHANGE


  navigate = (action) => {
    this.props.onNavigate(action)
  }

  view = (view) => {
    this.props.onViewChange(view)
  }

  viewNamesGroup(messages) {
    let viewNames = this.props.views
    const view = this.props.view
    let width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    let viewType = (width < 768) ? 'day' : 'month';

    if (viewNames.length > 1) {

      if (viewType === 'day') {
        viewNames = ['day'];
      }
      return (
        viewNames.map(name =>
          <button type='button' key={name}
            className={cn({ 'rbc-active': view === name })}
            id={view}
            onClick={this.view.bind(null, name)}
          >
            {messages[name]}
          </button>
        )
      )
    }
  }

  render() {
    const { classes } = this.props;
    let { messages, label } = this.props;

    messages = message(messages)

    const currentDateString = this.props.currentDate.toString();

    return (
      <div>
        <div className='rbc-toolbar'>
          <span className='rbc-toolbar-label monthlabel'>
            {label}
          </span>
        </div>
        <div>
          <span>
            <TextField
              id="date"
              label="Schedule Date"
              type="date"
              onChange={this.handleChangeFor('currentDate')}
              className={classes.textField}
              inputStyle={styles.textField}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </span>
          <span>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => { handleClickChangeDate(this.state.currentDate, this.props) }}
              className={classes.button}
              style={{ backgroundColor: "#999999", color: "#ffffff" }}
            >
              Change Date
        </Button>
          </span>
          <span>
            <Button
              onClick={() => { handleClickSubmit(this.props) }}
              variant="contained"
              color="primary"
              style={{ backgroundColor: "#999999", color: "#ffffff" }}
            >
              Submit changes to Third-Party Scheduling Application
        </Button>

            {/* <button type='button' onClick={this.navigate.bind(null, navigate.PREVIOUS)}>
          <i className="fa fa-angle-left" aria-hidden="true"></i>
        </button>
        <button type='button' onClick={this.navigate.bind(null, navigate.NEXT)}>
            <i className="fa fa-angle-right" aria-hidden="true"></i>
        </button> */}
          </span>
        </div>
        {/*<span className='rbc-btn-group todaybtn'>*/}
        {/* <span className='rbc-btn-group monthweekbtn'>
        <button
          type='button'
          onClick={this.navigate.bind(null, navigate.TODAY)}
        >
          {messages.today}
        </button>
      {
        this.viewNamesGroup(messages)
      }
      </span> */}

      </div>
    );
  }

}

export default connect(mapStateToProps)(withStyles(styles)(Toolbar));
