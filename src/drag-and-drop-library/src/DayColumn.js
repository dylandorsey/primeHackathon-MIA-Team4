import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';
import Selection, { getBoundsForNode, isEvent } from './Selection';
import dates from './utils/dates';
import { isSelected } from './utils/selection';
import localizer from './localizer'
import { notify } from './utils/helpers';
import { accessor, elementType, dateFormat } from './utils/propTypes';
import { accessor as get } from './utils/accessors';
import getStyledEvents, { positionFromDate, startsBefore } from './utils/dayViewLayout'
import TimeColumn from './TimeColumn';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

function snapToSlot(date, step) {
  var roundTo = 1000 * 60 * step;
  return new Date(Math.floor(date.getTime() / roundTo) * roundTo)
}

function startsAfter(date, max) {
  return dates.gt(dates.merge(max, date), max, 'minutes')
}

const styles = () => ({
  list: {
    width: 335,
  },
  fullList: {
    width: 'auto',
  },
  root: {
    width: '100%',
  },
});

const mapStateToProps = state => ({
  user: state.user,
});

class DaySlot extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      left: false,
      open: false,
      anchorEl: null,
      selectedItemId: -1
    }
  }

  // START FUNCTIONS FOR MENU
  handleClick = event => {
    let idx = event.currentTarget.getAttribute('data-idx');
    console.log('ID OF THE ITEM', idx);
    this.setState({ anchorEl: event.currentTarget, selectedItemId: idx });
  };

  handleClose = () => {
    this.setState({ anchorEl: null, selectedItemId: -1 });
  };
  // END FUNCTIONS FOR MENU

  render() {
    const { anchorElement, popperOpen } = this.state;
    const open = !!anchorElement;

  }

  renderStaffs(staffs) {

    if (staffs) {
      return staffs.map((obj, index) => {
        return (
          <div className="info-p" key={index}>
            <img src={obj.image} width="35px" height="35px" />
            <p>{obj.staffName}</p>
          </div>
        );
      });
    }
  }

  static propTypes = {
    events: PropTypes.array.isRequired,
    step: PropTypes.number.isRequired,
    min: PropTypes.instanceOf(Date).isRequired,
    max: PropTypes.instanceOf(Date).isRequired,
    now: PropTypes.instanceOf(Date),

    rtl: PropTypes.bool,
    titleAccessor: accessor,

    // @Appointment field info declaration
    patientNameAccessor: accessor,
    clinicianImageAccessor: accessor,
    clinicianNameAccessor: accessor,
    appointmentTypeAccessor: accessor,
    appointmentTimeAccessor: accessor,
    appointmentAddressAccessor: accessor,
    coPayAccessor: accessor,
    soapNoteTitleAccessor: accessor,
    setProfileTitleAccessor: accessor,
    staffsAccessor: accessor,
    isRecurrenceAccessor: accessor,
    isRecurrenceEditAccessor: accessor,
    isEditAccessor: accessor,
    isDeleteAccessor: accessor,
    isCancelAccessor: accessor,
    isUnCancelAccessor: accessor,
    cancellationReasonAccessor: accessor,
    isAppointmentRenderedAccessor: accessor,
    isVideoCallAccessor: accessor,
    isAppoinmentCancelledAccessor: accessor,
    practitionerNameAccessor: accessor,
    phoneAccessor: accessor,
    emailAccessor: accessor,
    resourceIdAccessor: accessor,
    durationAccessor: accessor,
    dateAccessor: accessor,
    formsAccessor: accessor,
    numberOfBedroomsAccessor: accessor,
    numberOfBathroomsAccessor: accessor,
    fireplaceEnhancementAccessor: accessor,
    tvScreenEnhancementAccessor: accessor,
    condominiumCommentsAccessor: accessor,
    propertyCommentsAccessor: accessor,
    squareFootAccessor: accessor,
    howToAccessHomeAccessor: accessor,
    petsAccessor: accessor,
    chargedHomeEnhancements: accessor,
    chargedNeighborhoodEnhancements: accessor,
    amountPaid: accessor,



    allDayAccessor: accessor.isRequired,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,

    selectRangeFormat: dateFormat,
    eventTimeRangeFormat: dateFormat,
    culture: PropTypes.string,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    eventOffset: PropTypes.number,

    onSelecting: PropTypes.func,
    onSelectSlot: PropTypes.func.isRequired,
    onSelectEvent: PropTypes.func.isRequired,

    className: PropTypes.string,
    dragThroughEvents: PropTypes.bool,
    eventPropGetter: PropTypes.func,
    dayWrapperComponent: elementType,
    eventComponent: elementType,
    eventWrapperComponent: elementType.isRequired,
    resource: PropTypes.string,
  };

  componentDidMount() {
    this.props.selectable
      && this._selectable()
  }

  componentWillUnmount() {
    this._teardownSelectable();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable)
      this._selectable();
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable();
  }

  render() {
    const {
      min,
      max,
      step,
      now,
      selectRangeFormat,
      culture,
      ...props
    } = this.props

    this._totalMin = dates.diff(min, max, 'minutes')

    let { selecting, startSlot, endSlot } = this.state
    let style = this._slotStyle(startSlot, endSlot)

    let selectDates = {
      start: this.state.startDate,
      end: this.state.endDate
    };

    let lastNodeOfWeek = document.getElementsByClassName('rbc-day-slot');
    let len = lastNodeOfWeek.length;

    // @Week add class to last column - for sat
    let lastelement = len < 1 ? '' : lastNodeOfWeek[len - 1];
    if (lastelement.classList !== undefined) {
      lastelement.classList.add('custom-class-sat')
    }

    // @Week add class to last column - for friday
    let secondLastElement = len < 2 ? '' : lastNodeOfWeek[len - 2];
    if (secondLastElement.classList !== undefined) {
      secondLastElement.classList.add('custom-class-sat')
    }

    return (
      <TimeColumn
        {...props}
        className={cn(
          'rbc-day-slot',
          dates.isToday(max) && 'rbc-today'
        )}
        now={now}
        min={min}
        max={max}
        step={step}
      >
        {this.renderEvents()}

        {selecting &&
          <div className='rbc-slot-selection' style={style}>
            <span>
              {localizer.format(selectDates, selectRangeFormat, culture)}
            </span>
          </div>
        }
      </TimeColumn>
    );
  }

  renderEvents = () => {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    let {
      events
      , min
      , max
      , culture
      , eventPropGetter
      , selected, eventTimeRangeFormat, eventComponent
      , eventWrapperComponent: EventWrapper
      , rtl: isRtl
      , step
      , startAccessor
      , endAccessor
      , titleAccessor
      , patientNameAccessor
      , clinicianImageAccessor
      , clinicianNameAccessor
      , appointmentTypeAccessor
      , appointmentTimeAccessor
      , appointmentAddressAccessor
      , coPayAccessor
      , soapNoteTitleAccessor
      , setProfileTitleAccessor
      , staffsAccessor
      , isRecurrenceAccessor
      , isRecurrenceEditAccessor
      , isEditAccessor
      , isDeleteAccessor
      , isCancelAccessor
      , isUnCancelAccessor
      , cancellationReasonAccessor
      , isAppointmentRenderedAccessor
      , isVideoCallAccessor
      , isAppoinmentCancelledAccessor
      , phoneAccessor
      , emailAccessor
      , resourceIdAccessor
      , durationAccessor
      , dateAccessor
      , formsAccessor
      , numberOfBathroomsAccessor
      , numberOfBedroomsAccessor
      , fireplaceEnhancementAccessor
      , tvScreenEnhancementAccessor
      , condominiumCommentsAccessor
      , propertyCommentsAccessor
      , squareFootAccessor
      , howToAccessHomeAccessor
      , petsAccessor
      , chargedHomeEnhancementsAccessor
      , chargedNeighborhoodEnhancementsAccessor
      , amountPaidAccessor

      , practitionerNameAccessor } = this.props;


    let EventComponent = eventComponent

    let styledEvents = getStyledEvents({
      events, startAccessor, endAccessor, min, totalMin: this._totalMin, step
    })

    return styledEvents.map(({ event, style }, idx) => {
      let start = get(event, startAccessor)
      let end = get(event, endAccessor)

      let continuesPrior = startsBefore(start, min)
      let continuesAfter = startsAfter(end, max)

      let title = get(event, titleAccessor)

      // @Appointment associate appointment data with the fields
      let patientName = get(event, patientNameAccessor);
      let clinicianImage = get(event, clinicianImageAccessor);
      let clinicianName = get(event, clinicianNameAccessor);
      let appointmentType = get(event, appointmentTypeAccessor);
      let appointmentTime = get(event, appointmentTimeAccessor);
      let appointmentAddress = get(event, appointmentAddressAccessor);
      let coPay = get(event, coPayAccessor);
      let soapNoteTitle = get(event, soapNoteTitleAccessor);
      let setProfileTitle = get(event, setProfileTitleAccessor);
      let staffs = get(event, staffsAccessor);
      let isRecurrence = get(event, isRecurrenceAccessor);
      let isRecurrenceEdit = get(event, isRecurrenceEditAccessor);
      let isEdit = get(event, isEditAccessor);
      let isDelete = get(event, isDeleteAccessor);
      let isCancel = get(event, isCancelAccessor);
      let isUnCancel = get(event, isUnCancelAccessor);
      let cancellationReason = get(event, cancellationReasonAccessor);
      let isAppointmentRendered = get(event, isAppointmentRenderedAccessor);
      let isVideoCall = get(event, isVideoCallAccessor);
      let isAppoinmentCancelled = get(event, isAppoinmentCancelledAccessor);
      let practitionerName = get(event, practitionerNameAccessor);
      let phone = get(event, phoneAccessor);
      let email = get(event, emailAccessor);
      let resourceId = get(event, resourceIdAccessor);
      let duration = get(event, durationAccessor);
      let date = get(event, dateAccessor);
      let forms = get(event, formsAccessor);
      let numberOfBedrooms = get(event, numberOfBedroomsAccessor);
      let numberOfBathrooms = get(event, numberOfBathroomsAccessor);
      let fireplaceEnhancement = get(event, fireplaceEnhancementAccessor);
      let tvScreenEnhancement = get(event, tvScreenEnhancementAccessor);
      let condominiumComments = get(event, condominiumCommentsAccessor);
      let propertyComments = get(event, propertyCommentsAccessor);
      let squareFoot = get(event, squareFootAccessor);
      let howToAccessHome = get(event, howToAccessHomeAccessor);
      let pets = get(event, petsAccessor);
      let chargedHomeEnhancements = get(event, chargedHomeEnhancementsAccessor);
      let chargedNeighborhoodEnhancements = get(event, chargedNeighborhoodEnhancementsAccessor);
      let amountPaid = get(event, amountPaidAccessor);

      let label = localizer.format({ start, end }, eventTimeRangeFormat, culture)
      let _isSelected = isSelected(event, selected)
      let viewClass = '';
      let getEndHour = end.getHours();

      if (getEndHour > 17) {
        viewClass = this.props.view === 'week' ? 'appointment_box dayslot hoverup' : 'appointment_box hoverup';
      } else {
        viewClass = this.props.view === 'week' ? 'appointment_box dayslot' : 'appointment_box';
      }

      let dayClass = this.props.view === 'day' ? 'colwrap' : '';

      if (eventPropGetter)
        var { style: xStyle, className } = eventPropGetter(event, start, end, _isSelected,)

      let { height, top, width, xOffset } = style

      return (
        <EventWrapper event={event} key={'evt_' + idx}>

          <div
            style={{
              ...xStyle,
              top: `${top}%`,
              height: `${height}%`,
              [isRtl ? 'right' : 'left']: `${Math.max(0, xOffset)}%`,
              width: `${width}%`,
              // SET EVENT BACKGROUND COLOR BASED UPON EVENT KEY
              backgroundColor: `${event.backgroundColor}`
              // END SET EVENT BACKGROUND COLOR BASED UPON EVENT KEY
            }}
            className={cn(`rbc-event ${dayClass}`, className, {
              'rbc-selected': _isSelected,
              'rbc-event-continues-earlier': continuesPrior,
              'rbc-event-continues-later': continuesAfter
            })}
          >
            <div className='rbc-event-label rbc-event-content textoverflow'>
              <p><b>Photographer:</b> {resourceId}</p> 
              <p>{title} {label}</p>
              <p>{appointmentType}</p>
              <p>{appointmentAddress}</p>
              <p>Square foot: {squareFoot} </p>
              <p className="phoneNumber">Phone: <a href="tel:{phone}" className="phoneNumber">{phone}</a></p>
              <p>Email: {email}</p>
              <div >
              <Button 
                className="menuButton"
                aria-owns={anchorEl ? 'simple-menu' + idx : null}
                aria-haspopup="true"
                data-idx={idx}
                onClick={this.handleClick}
              >
                <i className="fa fa-info-circle fa-2x" aria-hidden="true"></i>
                </Button>
                </div>
              <Menu
                id={'simple-menu' + idx}
                anchorEl={anchorEl}
                open={this.state.selectedItemId == idx}
                onClose={this.handleClose}
              >
                <MenuItem onClick={this.handleClose}><b>Contact info: </b> {title}, <a href="tel:{phone}">{phone}</a></MenuItem>
                <MenuItem onClick={this.handleClose}><b>Time of appointment: </b> {label}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Appointment date: </b> {date} </MenuItem>
                <MenuItem onClick={this.handleClose}><b>Appointment type: </b> {appointmentType}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Shoot confirmed </b> <input type="checkbox" defaultChecked /> </MenuItem>
                <MenuItem onClick={this.handleClose}><b>Address: </b> {appointmentAddress}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Square foot: </b> {squareFoot}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>How to access home: </b> {howToAccessHome} </MenuItem>
                <MenuItem onClick={this.handleClose}><b>Number of bathrooms: </b> {numberOfBathrooms}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Number of bedrooms: </b> {numberOfBedrooms}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Pets:</b> {pets}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Photographer:</b> {resourceId}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Fireplace Enhancement:</b> {fireplaceEnhancement}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>TV Enhancement:</b> {tvScreenEnhancement}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Charged home enhancements:</b> {chargedHomeEnhancements}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Charged neighborhood enhancements:</b> {chargedNeighborhoodEnhancements}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Comments for condominium:</b> {condominiumComments}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Comments about property:</b> {propertyComments}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Ammount paid:</b> {amountPaid}</MenuItem>
                <MenuItem onClick={this.handleClose}><b>Phone:</b> <a href="tel:{phone}">{phone}</a> </MenuItem>
                <MenuItem onClick={this.handleClose}><b>Email:</b> {email} </MenuItem>
              </Menu>
            </div>
          </div>
        </EventWrapper>
      )
    })
  };

  _slotStyle = (startSlot, endSlot) => {
    let top = ((startSlot / this._totalMin) * 100);
    let bottom = ((endSlot / this._totalMin) * 100);

    return {
      top: top + '%',
      height: bottom - top + '%'
    }
  };

  _selectable = () => {
    let node = findDOMNode(this);
    let selector = this._selector = new Selection(() => findDOMNode(this))

    let maybeSelect = (box) => {
      let onSelecting = this.props.onSelecting
      let current = this.state || {};
      let state = selectionState(box);
      let { startDate: start, endDate: end } = state;

      if (onSelecting) {
        if (
          (dates.eq(current.startDate, start, 'minutes') &&
            dates.eq(current.endDate, end, 'minutes')) ||
          onSelecting({ start, end }) === false
        )
          return
      }

      this.setState(state)
    }

    let selectionState = ({ y }) => {
      let { step, min, max } = this.props;
      let { top, bottom } = getBoundsForNode(node)

      let mins = this._totalMin;

      let range = Math.abs(top - bottom)

      let current = (y - top) / range;

      current = snapToSlot(minToDate(mins * current, min), step)

      if (!this.state.selecting)
        this._initialDateSlot = current

      let initial = this._initialDateSlot;

      if (dates.eq(initial, current, 'minutes'))
        current = dates.add(current, step, 'minutes')

      let start = dates.max(min, dates.min(initial, current))
      let end = dates.min(max, dates.max(initial, current))

      return {
        selecting: true,
        startDate: start,
        endDate: end,
        startSlot: positionFromDate(start, min, this._totalMin),
        endSlot: positionFromDate(end, min, this._totalMin)
      }
    }

    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)

    selector.on('mousedown', (box) => {
      if (this.props.selectable !== 'ignoreEvents') return

      return !isEvent(findDOMNode(this), box)
    })

    selector
      .on('click', (box) => {
        if (!isEvent(findDOMNode(this), box))
          this._selectSlot({ ...selectionState(box), action: 'click' })

        this.setState({ selecting: false })
      })

    selector
      .on('select', () => {
        if (this.state.selecting) {
          this._selectSlot({ ...this.state, action: 'select' })
          this.setState({ selecting: false })
        }
      })
  };

  _teardownSelectable = () => {
    if (!this._selector) return
    this._selector.teardown();
    this._selector = null;
  };

  _selectSlot = ({ startDate, endDate, action }) => {
    let current = startDate
      , slots = [];

    while (dates.lte(current, endDate)) {
      slots.push(current)
      current = dates.add(current, this.props.step, 'minutes')
    }

    notify(this.props.onSelectSlot, {
      slots,
      start: startDate,
      end: endDate,
      resourceId: this.props.resource,
      action
    })
  };

  _select = (...args) => {
    notify(this.props.onSelectEvent, args)
  };

  hoverDialogActions(event, e, action) {
    e.preventDefault();
    event.action = action;
    this._select(event, e);
  }
}



function minToDate(min, date) {
  var dt = new Date(date)
    , totalMins = dates.diff(dates.startOf(date, 'day'), date, 'minutes');

  dt = dates.hours(dt, 0);
  dt = dates.minutes(dt, totalMins + min);
  dt = dates.seconds(dt, 0)
  return dates.milliseconds(dt, 0)
}

DaySlot.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(withStyles(styles)(DaySlot));
