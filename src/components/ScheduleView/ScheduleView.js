import React, { Component } from 'react';
import { connect } from 'react-redux';


import 'react-confirm-alert/src/react-confirm-alert.css';
import './loader.css';

// dnd library imports //
import localizer from '../../drag-and-drop-library/src/localizers/globalize';
import globalize from 'globalize';

import '../../drag-and-drop-library/src/less/styles.less';
import '../../drag-and-drop-library/examples/styles.less';
import '../../drag-and-drop-library/examples/prism.less';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import BigCalendar from '../../drag-and-drop-library/src/index';
import withDragAndDrop from '../../drag-and-drop-library/src/addons/dragAndDrop';
// import resources from '../../drag-and-drop-library/stories/resourceEvents';
// end dnd library imports //

import Nav from '../../components/Nav/Nav';

import { USER_ACTIONS } from '../../redux/actions/userActions';
import { LOGIN_ACTIONS } from '../../redux/actions/loginActions';
import { SCHEDULE_ACTIONS } from '../../redux/actions/scheduleActions';

// FUNCTION IMPORTS
import {
    confirmTimeChange,
    dispatchActionToUpdateMovedEvents,
    orderEventsByResourceAndTime,
} from '../../Functions/ScheduleFunctions';
// END FUNCTION IMPORTS

localizer(globalize);

const mapStateToProps = state => ({
    currentAppointments: state.schedule.currentAppointments,
    currentDate: state.schedule.currentDate,
    currentDriveData: state.schedule.currentDriveData,
    pageIsLoading: state.schedule.pageIsLoading,
    resources: state.schedule.resources,
    user: state.user,
});

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

class ScheduleView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            events: [...this.props.currentAppointments],
            usersAvailability: {},
            pageIsLoading: this.props.pageIsLoading,
        }
        this.moveEvent = this.moveEvent.bind(this)
    }

    componentDidMount() {
        this.props.dispatch({
            type: USER_ACTIONS.FETCH_USER
        });
        this.getInitialAppointments();
    }

    componentDidUpdate() {
        if (!this.props.user.isLoading && this.props.user.userName === null) {
            this.props.history.push('home');
        }
    }

    // DISPATCH ACTION TO GET DRIVE TIME BETWEEN DROPPED LOCATION AND NEXT LOCATION
    getDriveData = (currentEvent, nextEvent) => {
        console.log('init getDriveData with payload:');
        const payload = {
            origins: currentEvent,
            destinations: nextEvent,
        };
        console.log(payload);
        this.props.dispatch({
            type: SCHEDULE_ACTIONS.GET_DRIVE_DATA,
            payload
        });
    } // END DISPATCH ACTION TO GET DRIVE TIME BETWEEN DROPPED LOCATION AND NEXT LOCATION

    // GET INITIAL APPOINTMENTS
    getInitialAppointments = () => {
        const date = this.props.currentDate;
        // const today = moment(new Date(2018, 6, 3, 0, 0, 0, 0)).format('MM/DD/YY');

        console.log('init getInitialAppointments');
        console.log('with today as: ' + date)
        const dateObject = {
            minDate: date,
            maxDate: date
        }
        this.props.dispatch({
            type: SCHEDULE_ACTIONS.GET_APPOINTMENTS_FROM_THIRDPARTY_API,
            payload: dateObject
        })
    }

    logout = () => {
        this.props.dispatch({
            type: LOGIN_ACTIONS.LOGOUT
        });
        // this.props.history.push('home');
    }

    // UPDATE DOM UPON MOVING EVENT
    moveEvent({ event, start, end, ...rest }) {
        console.log('init moveEvent for event:');
        console.log(event);
        let events = [...this.props.currentAppointments];
        console.log(events === this.props.currentAppointments);
        let idx = events.indexOf(event);
        // PARSE NEW RESOURCE TO LOCAL VARIABLES
        console.log('new resource is:');
        const newResource = this.props.resources.find(resource => resource.title === rest.resource);
        console.log(newResource);
        const resourceId = newResource.id;
        const calendarID = newResource.calendarID;
        const calendar = newResource.title;
        const backgroundColor = newResource.calendarColor;
        // END PARSE NEW RESOURCE TO LOCAL VARIABLES

        // UPDATE MOVED EVENT
        let updatedMovedEvent = { ...event, start, end, resourceId, calendar, calendarID, backgroundColor };
        console.log(updatedMovedEvent);
        console.log('event and updatedEvent have similar data?');
        console.log(updatedMovedEvent === event);
        console.log(idx);
        console.log(events[idx] === updatedMovedEvent);
        // END UPDATE MOVED EVENT


        // INSERT UPDATED MOVED EVENT INTO EVENTS ARRAY
        let nextEvents = [...events];
        nextEvents.splice(idx, 1, updatedMovedEvent);
        // END INSERT UPDATED MOVED EVENT INTO EVENTS ARRAY

        console.log('this.props.currentAppointments:');
        console.log(this.props.currentAppointments);
        console.log('events:');
        console.log(events);
        console.log('nextEvents:');
        console.log(nextEvents);
        console.log('events and nextEvents are equal arrays?')
        console.log(events === nextEvents);

        // ORDER EVENTS BY TIME WITHIN AN ARRAY FOR EACH RESOURCE
        // AND PUT THOSE ARRAYS OF EVENTS IN A PARENT ARRAY
        const previousArrayOfResourcesWithOrderedArraysOfEvents = orderEventsByResourceAndTime(this.props.resources, events);
        console.log('previousArrayOfResourcesWithOrderedArraysOfEvents:');
        console.log(previousArrayOfResourcesWithOrderedArraysOfEvents);
        const arrayOfResourcesWithOrderedArraysOfEvents = orderEventsByResourceAndTime(this.props.resources, nextEvents);
        console.log('arrayOfResourcesWithOrderedArraysOfEvents');
        console.log(arrayOfResourcesWithOrderedArraysOfEvents);
        // END ORDERING EVENTS

        // FIND THE EVENT BEFORE AND AFTER THE MOVED EVENT IN ITS ORDERED ARRAY BEFORE IT WAS MOVED
        const eventBeforeMovedEventInPreviousArray = this.selectEventBeforeMovedEventInOrderedArrayOfEvents(previousArrayOfResourcesWithOrderedArraysOfEvents, event.id);
        console.log('eventBeforeMovedEventInPreviousArray is:');
        console.log(eventBeforeMovedEventInPreviousArray);
        const eventAfterMovedEventInPreviousArray = this.selectEventAfterMovedEventInOrderedArrayOfEvents(previousArrayOfResourcesWithOrderedArraysOfEvents, event.id);
        console.log('eventAfterMovedEventInPreviousArray is:');
        console.log(eventAfterMovedEventInPreviousArray);
        // END FIND THE EVENT BEFORE AND AFTER THE MOVED EVENT IN ITS ORDERED ARRAY BEFORE IT WAS MOVED

        // FIND THE EVENT BEFORE AND AFTER THE MOVED EVENT IN ITS ORDERED ARRAY AFTER IT WAS MOVED
        const eventBeforeMovedEvent = this.selectEventBeforeMovedEventInOrderedArrayOfEvents(arrayOfResourcesWithOrderedArraysOfEvents, event.id);
        const eventAfterMovedEvent = this.selectEventAfterMovedEventInOrderedArrayOfEvents(arrayOfResourcesWithOrderedArraysOfEvents, event.id);
        // END FIND THE EVENT BEFORE AND AFTER THE MOVED EVENT IN ITS ORDERED ARRAY AFTER IT WAS MOVED
        console.log('dispatching action to update events upon drag and drop')
        const payload = {
            eventAfterMovedEvent: eventAfterMovedEvent,
            eventAfterMovedEventInPreviousArray: eventAfterMovedEventInPreviousArray,
            eventBeforeMovedEvent: eventBeforeMovedEvent,
            eventBeforeMovedEventInPreviousArray,
            updatedMovedEvent: updatedMovedEvent,
            events: nextEvents,
        }
        // IF MOVED EVENT IS AT A NEW TIME, CONFIRM TIME CHANGE
        console.log(event.start);
        console.log(updatedMovedEvent.start);
        console.log(event.start - updatedMovedEvent.start);
        if (event.start - updatedMovedEvent.start != 0) {
            let dialogueData = {
                title: 'Change times?',
                message: 'The appointment is dropping into a different start time. \n Do you want to change start times?'
            }
            confirmTimeChange(dialogueData, payload, this.props);
        }// END IF MOVED EVENT IS AT A NEW TIME, CONFIRM TIME CHANGE

        // CASE: MOVED EVENT DOES NOT CHANGE TIMESx
        else {
            dispatchActionToUpdateMovedEvents(payload, this.props);
        } // END CASE: MOVED EVENT DOES NOT CHANGE TIMES
    } // END UPDATE DOM UPON MOVING EVENT

    // ORDER EVENTS IN ARRAYS SORTED BY RESOURCE AND TIME
    orderEventsByResourceAndTime = (resourcesArray, eventsArray) => {
        console.log('init orderEventsByResourceAndTime, given resources and events:');
        console.log(resourcesArray);
        console.log(eventsArray);
        // create array to contain an array of events for each resource
        let arrayOfArrays = [];
        // creates an array of events for each resource
        for (let i = 0; i < resourcesArray.length; i++) {
            let currentResource = resourcesArray[i];
            let newArray = [];
            // each event is checked by resource id and pushed into that resources' array of events
            for (let j = 0; j < eventsArray.length; j++) {
                if (eventsArray[j].resourceId === currentResource.id) {
                    newArray.push(eventsArray[j])
                }
            }
            newArray.sort(this.compareEventStartTimes);
            arrayOfArrays.push(newArray);
        }
        return arrayOfArrays;
    } // END ORDER EVENTS IN ARRAYS SORTED BY RESOURCE AND TIME

    selectEventAfterMovedEventInOrderedArrayOfEvents = (arrayOfArrays, movedEventId) => {
        let eventAfterMovedEvent = {};
        for (let i = 0; i < arrayOfArrays.length; i++) {
            let currentEventsArray = arrayOfArrays[i];
            for (let j = 0; j < currentEventsArray.length; j++) {
                let currentEvent = currentEventsArray[j]
                if (currentEvent.id === movedEventId) {
                    eventAfterMovedEvent = currentEventsArray[j + 1];
                }
            }
        }
        return eventAfterMovedEvent;
    }

    selectEventBeforeMovedEventInOrderedArrayOfEvents = (arrayOfArrays, movedEventId) => {
        let eventBeforeMovedEvent = {};
        for (let i = 0; i < arrayOfArrays.length; i++) {
            let currentEventsArray = arrayOfArrays[i];
            for (let j = 0; j < currentEventsArray.length; j++) {
                let currentEvent = currentEventsArray[j]
                if (currentEvent.id === movedEventId) {
                    eventBeforeMovedEvent = currentEventsArray[j - 1];
                }
            }
        }
        return eventBeforeMovedEvent;
    }

    slotPropGetter(date) { // , start, end, isSelected
        // console.log('date.getDate()...', Object.prototype.toString.call(date))
        if (Object.prototype.toString.call(date) === '[object Date]') {
            let style = {
                backgroundColor: '#ccc',
            };
            let style1 = {
                backgroundColor: '#fff',
            };
            if (date.getDate() === 7) {

                return {
                    style: style,
                };
            } else {
                return {
                    style: style1,
                }
            }
        }
    }

    render() {
        let content = null;

        if (this.props.user.userName) {
            content = (
                <DragAndDropCalendar
                    className='demo'
                    selectable
                    events={this.props.currentAppointments}
                    resources={this.props.resources}
                    statusHeadings={[{ id: 1, title: 'connected' }, { id: 2, title: 'Confirmed' }]}
                    usersAvailability={this.state.usersAvailability}
                    onEventDrop={this.moveEvent}
                    defaultView='resource' // set to 'resource'
                    defaultDate={this.props.currentDate}
                    onSelectEvent={event => console.log(event)}
                // onSelectSlot={(slotInfo) => alert(
                //     `selected slot: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                //     `\nend: ${slotInfo.end.toLocaleString()}`
                //   )}
                />
            );
        }

        return (
            <div>
                <div className="navbar">
                    <Nav />
                </div>

                <div className="instructions">

                    {/* <h1 className="lead">{title}</h1> */}

                </div>

                {
                    this.props.pageIsLoading.status ?
                        <div className="loaderContainer">
                            <div className="loader">

                            </div>
                            <div className="loaderMessage">
                            <h4>{this.props.pageIsLoading.message}</h4>
                            </div>
                        </div>
                        :
                        <div>
                        { content }
                        </div>
                }

            </div>
        );
    }
}

// this allows us to use <App /> in index.js
export default connect(mapStateToProps)(DragDropContext(HTML5Backend)(ScheduleView));
