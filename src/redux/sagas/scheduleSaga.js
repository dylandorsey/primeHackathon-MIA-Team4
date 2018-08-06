import { put, takeLatest } from 'redux-saga/effects';
import { SCHEDULE_ACTIONS } from '../actions/scheduleActions';
import {
    callGetAppointmentsFromDatabase,
    callGetDriveData,
    callGetCalendarsFromDatabase,
    callPopulateDatabaseAppointmentsFromThirdPartyAPI,
    callPopulateDatabaseAppointmentsWithGeoCoordinates,
    callPopulateDatabaseCalendarsFromThirdPartyAPI,
    callPutAppointmentsFromDatabaseToThirdPartyAPI,
    callPutUpdatedAppointmentToDatabase,
} from '../requests/scheduleRequests';
import {
    convertAppointmentsFromDatabase,
    convertAppointmentForSendingToDatabase,
    extractResourcesFromCalendars,
    orderEventsByResourceAndTime,
    resetEventEndTime,
    updateOriginsEventWithDriveData,
} from '../../Functions/ScheduleFunctions';

function* initiateGetDriveData(locationsObject) {
    console.log('init initiateGetDriveData with locationsObject:');
    console.log(locationsObject)
    try {
        const driveData = yield callGetDriveData(locationsObject);
        yield console.log('response from server is drive data:');
        yield console.log(driveData)
        yield put({
            type: SCHEDULE_ACTIONS.SET_CURRENT_DRIVE_DATA,
            payload: driveData,
        });
    } catch (error) {
        console.log('GET DRIVETIME FAILED', error);
    }
}

function* getAppointmentsFromThirdPartyAPI(action) {
    console.log('init populateDatabaseAppointmentsFromThirdPartyAPI');
    console.log(action.payload);
    let dateObject = (action.payload)
    let message = 'Fetching appointments...';
    try {
        yield startPageLoadingSpinner(message);
        // POPULATE THE DATABASE WITH DATA FROM THIRD-PARTY SCHEDULING API
        yield callPopulateDatabaseAppointmentsFromThirdPartyAPI(dateObject);
        yield callPopulateDatabaseAppointmentsWithGeoCoordinates();
        yield callPopulateDatabaseCalendarsFromThirdPartyAPI();
        // END POPULATE THE DATABASE WITH DATA FROM THIRD-PARTY SCHEDULING API
        // GET DATA FROM DATABASE
        const rawAppointmentsFromDataBase = yield callGetAppointmentsFromDatabase();
        const rawCalendarListFromDatabase = yield callGetCalendarsFromDatabase();
        // END GET DATA FROM DATABASE
        // CONVERT DATA TO FORMAT USEABLE BY DRANG-AND-DORPCALENDAR LIBRARY
        const convertedCalendarsFromDatabase = yield extractResourcesFromCalendars(rawCalendarListFromDatabase);
        console.log('raw resource list is:');
        console.log(rawCalendarListFromDatabase);
        console.log('converted resource list is:');
        console.log(convertedCalendarsFromDatabase);
        const convertedAppointmentsFromDataBase = yield convertAppointmentsFromDatabase(rawAppointmentsFromDataBase);
        // END CONVERT DATA TO FORMAT USEABLE BY DRANG-AND-DORPCALENDAR LIBRARY
        // UPDATE SCHEDULE REDUCER WITH CONVERTED DATA
        yield put({
            type: SCHEDULE_ACTIONS.SET_RESOURCES,
            payload: convertedCalendarsFromDatabase,
        })
        const appointmentsWithInitialDriveTimes = yield getInitialDriveData(convertedAppointmentsFromDataBase, convertedCalendarsFromDatabase);
        yield put({
            type: SCHEDULE_ACTIONS.SET_APPOINTMENTS_FROM_DATABASE,
            payload: appointmentsWithInitialDriveTimes,
        })
        // END UPDATE SCHEDULE REDUCER WITH CONVERTED DATA
        yield endPageLoadingSpinner();
    } catch (error) {
        console.log('POPULATE DATABASE WITH THIRD-PARTY APPOINTMENTS FAILED', error);
    }
}

function* getInitialDriveData(appointmentsArray, resourcesArray) {
    console.log('init getInitialDriveTimes');
    const events = appointmentsArray;
    const resources = resourcesArray;
    console.log(events);
    const nextEvents = events;
    let currentEvent;
    let locationsObject;
    let nextEvent;
    let updatedEvent;
    let message = 'Getting initial commute data...';
    const arrayOfResourcesWithOrderedArraysOfEvents = orderEventsByResourceAndTime(resources, events);
    console.log('the array of resources with arrays of events is:');
    console.log(arrayOfResourcesWithOrderedArraysOfEvents);
    try {
        yield startPageLoadingSpinner(message);
        // LOOP THROUGH EACH RESOURCE ARRAY
        for (let i = 0; i < arrayOfResourcesWithOrderedArraysOfEvents.length; i++) {
            let currentResourceEvents = arrayOfResourcesWithOrderedArraysOfEvents[i];
            console.log('the current resource events array is: ');
            console.log(currentResourceEvents);
            // loop through event array
            for (let j = 0; j < currentResourceEvents.length - 1; j++) {
                const idx = events.indexOf(currentResourceEvents[j]);
                currentEvent = currentResourceEvents[j];
                // CASE: CURRENT EVENT IS IN THE PAST
                if (currentEvent.end < new Date()) {
                    console.log('current event ends in the past. Drive data cannot be fetched');
                } else {
                    nextEvent = currentResourceEvents[j + 1];
                    console.log('current event is: ' + j + ' of ' + currentResourceEvents.length);
                    console.log(currentEvent);
                    console.log('Its index in events array is ' + idx);
                    console.log('next event is:')
                    console.log(nextEvent);
                    locationsObject = {
                        origins: currentEvent,
                        destinations: nextEvent,
                    }
                    // GET DRIVE TIME BETWEEN CURRENT EVENT AND NEXT EVENT
                    let currentDriveData = yield callGetDriveData(locationsObject);
                    updatedEvent = yield updateOriginsEventWithDriveData(currentDriveData, currentEvent)
                    nextEvents.splice(idx, 1, updatedEvent);
                    console.log('updated nextEvents array:');
                    console.log('returning events array');
                    console.log(nextEvents);
                    // UDPDATE THE DATABASE WITH UPDATED EVENT
                    yield put({
                        type: SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE,
                        payload: updatedEvent
                    }) // END UPDATE THE DATABASE WITH UPDATED EVENT
                }
            }// END LOOP THROUGH EACH RESOURCE ARRAY
        }
        yield endPageLoadingSpinner();
    } catch (error) {
        console.log('GET INITIAL DRIVE DATA FAILED', error);
    }
    return nextEvents;

} // END PARSE EVENTS ARRAY AND GET DRIVE TIMES BETWEEN EVENTS


function* putAppointmentToDataBase(action) {
    console.log('init putAppointmentsInDatabase');
    const updatedAppointmentObject = yield convertAppointmentForSendingToDatabase(action.payload);
    console.log('sending updated appointment to database:');
    console.log(updatedAppointmentObject);
    yield callPutUpdatedAppointmentToDatabase(updatedAppointmentObject);
}

function* initiatePutAppointmentsToThirdPartyAPI() {
    console.log('init putAppointmentsToThirdPartyAPI');
    try {
        const response = yield callPutAppointmentsFromDatabaseToThirdPartyAPI();
        console.log(response);
    } catch (error) {
        console.log('UPDATE THIRD-PARTY API WITH APPOINTMENTS FAILED', error);
    }

}

function* endPageLoadingSpinner() {
    console.log('ending page loading spinner');
    const payload = {
        status: false
    }
    try {
        yield put({
            type: SCHEDULE_ACTIONS.END_PAGE_IS_LOADING,
            payload
        })
    } catch (error) {
        console.log('END PAGE LOADING SPINNER FAILED', error);
    }
}

function* startPageLoadingSpinner(message) {
    console.log('starting page loading spinner');
    console.log(message);
    const payload = {
        status: true,
        message: message,
    }
    try {
        yield put({
            type: SCHEDULE_ACTIONS.START_PAGE_IS_LOADING,
            payload
        })
    } catch (error) {
        console.log('START PAGE LOADING SPINNER FAILED', error);
    }
}


function* updateCurrentDate(action) {
    console.log('init updateCurrentDate');
    const newDate = action.payload;
    const dateObject = {
        minDate: action.payload,
        maxDate: action.payload
    }
    try {
        yield put({
            type: SCHEDULE_ACTIONS.SET_CURRENT_DATE,
            payload: newDate,
        })
        yield put({
            type: SCHEDULE_ACTIONS.GET_APPOINTMENTS_FROM_THIRDPARTY_API,
            payload: dateObject
        })
    } catch (error) {
        console.log('UPDATE CURRENT DATE FAILED', error);
    }
}

function* updateEventsUponMove(action) {
    console.log('init saga updateEventsUponMove');
    const updatedMovedEvent = action.payload.updatedMovedEvent;
    const events = action.payload.events;

    let currentDriveData;
    let driveDistanceToNextAppointment;
    let driveTimeToNextAppointment;
    let end;
    let eventToUpdate;
    let idx;
    let locationsObject;
    let message = 'Updating appointments.';
    let updatedEvent;

    try {
        // UPDATE MOVED EVENT
        startPageLoadingSpinner(message);
        console.log('Updating the moved event.');
        eventToUpdate = updatedMovedEvent;
        idx = events.indexOf(eventToUpdate)
        // RESET EVENT END TIME
        end = yield resetEventEndTime(eventToUpdate.start, eventToUpdate.duration);
        yield console.log(`reset end time to ${end}`)
        // END RESET EVENT END TIME
        // RESET DRIVE DATA
        driveDistanceToNextAppointment = '';
        driveTimeToNextAppointment = '';
        // END RESET DRIVE DATA
        // UPDATE MOVED EVENT PROPERTIES WITH UPDATED INFORMATION
        updatedEvent = { ...eventToUpdate, driveDistanceToNextAppointment, driveTimeToNextAppointment, end };
        // END UPDATE MOVED EVENT PROPERTIES WITH UPDATED INFORMATION

        // CASE: AN EVENT AFTER THE MOVED EVENT EXISTS
        if (action.payload.eventAfterMovedEvent) {

            const eventAfterMovedEvent = action.payload.eventAfterMovedEvent;
            //CASE: EVENT AFTER THE MOVED EVENT IS NOT THE SAME AS BEFORE THE MOVE
            if (eventAfterMovedEvent !== action.payload.eventAfterMovedEventInPreviousArray) {
                yield console.log('An event after the moved event exists. Updating drive data');
                // GET DRIVE DATA
                locationsObject = {
                    origins: eventToUpdate,
                    destinations: eventAfterMovedEvent
                }
                // CALCULATE DRIVE DATA BETWEEN THE MOVED EVENT AND THE EVENT AFTER THE MOVED EVENT
                currentDriveData = yield callGetDriveData(locationsObject);
                // END CALCULATE DRIVE DATA BETWEEN MOVED EVENT AND THE EVENT AFTER THE MOVED EVENT
                // END GET DRIVE DATA

                // UPDATE EVENT END TIME TO INCLUDE DRIVE TIME AND DISTANCE
                yield console.log('Now updating event with currentDriveData');
                updatedEvent = yield updateOriginsEventWithDriveData(currentDriveData, updatedEvent)
                yield console.log(updatedEvent);
                // END UPDATE EVENT END TIME TO INCLUDE DRIVE TIME AND DISTANCE

                // UPDATE EVENTS ARRAY WITH UPDATED EVENT
                yield events.splice(idx, 1, updatedEvent);
                // END UPDATE EVENTS ARRAY WITH UPDATED EVENT

                yield console.log('putting appointment to database from scheduleSaga:');
                // UDPDATE THE DATABASE WITH UPDATED EVENT
                yield put({
                    type: SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE,
                    payload: updatedEvent
                }) // END UPDATE THE DATABASE WITH UPDATED EVENT

            }// END CASE: EVENT AFTER THE MOVED EVENT IS NOT THE SAME AS BEFORE THE MOVE
            // CASE: EVENT AFTER THE MOVED EVENT IS THE SAME AS BEFORE THE MOVE
            else {
                yield console.log('Event order did not change');
            } // END CASE: EVENT AFTER THE MOVED EVENT IS THE SAME AS BEFORE THE MOVE
        } //CASE: AN EVENT AFTER THE MOVED EVENT EXISTS, GET DRIVE DATA

        // CASE: NO EVENT AFTER THE MOVED EVENT
        else {
            yield console.log('No event exists after the moved event.');
            yield console.log('Moved event updated to:')
            yield console.log(updatedEvent);
            // UPDATE EVENTS ARRAY WITH UPDATED EVENT
            yield events.splice(idx, 1, updatedEvent);
            // END UPDATE EVENTS ARRAY WITH UPDATED EVENT

            yield console.log('putting appointment to database from scheduleSaga:');
            // UDPDATE THE DATABASE WITH UPDATED EVENT
            yield put({
                type: SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE,
                payload: updatedEvent
            }) // END UPDATE THE DATABASE WITH UPDATED EVENT
        } // END CASE: NO EVENT AFTER THE MOVED EVENT
        // END UPDATE MOVED EVENT

        // CASE: AN EVENT BEFORE THE MOVED EVENT EXISTS
        if (action.payload.eventBeforeMovedEvent) {
            const eventBeforeMovedEvent = action.payload.eventBeforeMovedEvent;
            // CASE: EVENT BEFORE MOVED EVENT IS NOT THE SAME EVENT AS BEFORE THE MOVE
            if (eventBeforeMovedEvent !== action.payload.eventBeforeMovedEventInPreviousArray) {
                yield console.log('An event before the moved event exists. Updating that event.');
                eventToUpdate = eventBeforeMovedEvent;
                idx = events.indexOf(eventToUpdate)

                // GET DRIVE DATA
                locationsObject = {
                    origins: eventBeforeMovedEvent,
                    destinations: updatedMovedEvent
                }
                // RESET EVENT END TIME
                end = yield resetEventEndTime(eventToUpdate.start, eventToUpdate.duration);
                yield console.log(`reset end time to ${end}`)
                updatedEvent = { ...eventToUpdate, end };
                // END RESET EVENT END TIME

                // CALCULATE DRIVE DATA BETWEEN THE MOVED EVENT AND THE EVENT AFTER THE MOVED EVENT
                currentDriveData = yield callGetDriveData(locationsObject);
                // END CALCULATE DRIVE DATA BETWEEN MOVED EVENT AND THE EVENT AFTER THE MOVED EVENT
                // END GET DRIVE DATA

                // UPDATE EVENT END TIME TO INCLUDE DRIVE TIME AND DISTANCE
                yield console.log('updating event with currentDriveData');
                updatedEvent = yield updateOriginsEventWithDriveData(currentDriveData, updatedEvent)
                yield console.log('Updated new drive data:')
                yield console.log(updatedEvent);
                // END UPDATE EVENT END TIME TO INCLUDE DRIVE TIME AND DISTANCE

                // UPDATE EVENTS ARRAY WITH UPDATED EVENT
                yield events.splice(idx, 1, updatedEvent);
                // END UPDATE EVENTS ARRAY WITH UPDATED EVENT


                yield console.log('putting appointment to database from scheduleSaga:');
                // UDPDATE THE DATABASE WITH UPDATED EVENT
                yield put({
                    type: SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE,
                    payload: updatedEvent
                }) // END UPDATE THE DATABASE WITH UPDATED EVENT
            } // END CASE: EVENT BEFORE MOVED EVENT IS NOT THE SAME EVENT AS BEFORE THE MOVE
            // CASE: EVENT BEFORE MOVED EVENT IS THE SAME EVENT AS BEFORE THE MOVE
            else {
                yield console.log('Event order did not change.');
            } // END CASE: EVENT BEFORE MOVED EVENT IS THE SAME EVENT AS BEFORE THE MOVE
        } // END CASE: AN EVENT BEFORE THE MOVED EVENT EXISTS

        // CASE: EVENT BEFORE MOVED EVENT IN PREVIOUS ARRAY EXISTS
        if (action.payload.eventBeforeMovedEventInPreviousArray) {
            const eventBeforeMovedEventInPreviousArray = action.payload.eventBeforeMovedEventInPreviousArray;
            yield console.log('An event exists before the moved event in the previous array.')
            yield console.log('Checking whether the moved event is in a new array.')
            // CHECK WHETHER EVENT BEFORE MOVED EVENT IN PREVIOUS ARRAY IS THE
            // SAME EVENT AS BEFORE THE MOVED EVENT IN THE NEW ARRAY
            if (action.payload.eventBeforeMovedEvent !== eventBeforeMovedEventInPreviousArray) {
                yield console.log('Updating the event before the moved event in the previous array.')
                eventToUpdate = eventBeforeMovedEventInPreviousArray;
                idx = events.indexOf(eventToUpdate)
                // RESET EVENT END TIME
                end = yield resetEventEndTime(eventToUpdate.start, eventToUpdate.duration);
                yield console.log(`reset end time to ${end}`)
                // END RESET EVENT END TIME
                // RESET DRIVE DATA
                driveDistanceToNextAppointment = '';
                driveTimeToNextAppointment = '';
                // END RESET DRIVE DATA
                // UPDATE MOVED EVENT PROPERTIES WITH UPDATED INFORMATION
                updatedEvent = { ...eventToUpdate, driveDistanceToNextAppointment, driveTimeToNextAppointment, end };
                // END UPDATE MOVED EVENT PROPERTIES WITH UPDATED INFORMATION

                // CASE: EVENT AFTER MOVED EVENT IN PREVIOUS ARRAY EXISTS
                if (action.payload.eventAfterMovedEventInPreviousArray) {
                    const eventAfterMovedEventInPreviousArray = action.payload.eventAfterMovedEventInPreviousArray;
                    yield console.log('An event exists after the moved event in the previous array.');
                    yield console.log('Getting drive data.');
                    // GET DRIVE DATA
                    locationsObject = {
                        origins: eventBeforeMovedEventInPreviousArray,
                        destinations: eventAfterMovedEventInPreviousArray
                    }
                    yield console.log(locationsObject);
                    // CALCULATE DRIVE DATA BETWEEN THE MOVED EVENT AND THE EVENT AFTER THE MOVED EVENT
                    currentDriveData = yield callGetDriveData(locationsObject);
                    // END CALCULATE DRIVE DATA BETWEEN MOVED EVENT AND THE EVENT AFTER THE MOVED EVENT

                    // UPDATE EVENT END TIME TO INCLUDE DRIVE TIME AND DISTANCE
                    yield console.log('updating event with currentDriveData');
                    updatedEvent = yield updateOriginsEventWithDriveData(currentDriveData, updatedEvent)
                    yield console.log('Updated with new drive data:');
                    yield console.log(updatedEvent);
                    // END UPDATE EVENT END TIME TO INCLUDE DRIVE TIME AND DISTANCE
                    // END GET DRIVE DATA

                    // UPDATE EVENTS ARRAY WITH UPDATED EVENT
                    yield events.splice(idx, 1, updatedEvent);
                    // END UPDATE EVENTS ARRAY WITH UPDATED EVENT

                    yield console.log('putting appointment to database from scheduleSaga:');
                    // UDPDATE THE DATABASE WITH UPDATED EVENT
                    yield put({
                        type: SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE,
                        payload: updatedEvent
                    }) // END UPDATE THE DATABASE WITH UPDATED EVENT
                }// END CASE: EVENT AFTER MOVED EVENT IN PREVIOUS ARRAY EXISTS
                yield console.log('No event exists after the moved event in the previous array.');
                // UPDATE EVENTS ARRAY WITH UPDATED EVENT
                yield console.log('The updated event is:');
                yield console.log(updatedEvent);
                yield events.splice(idx, 1, updatedEvent);
                // END UPDATE EVENTS ARRAY WITH UPDATED EVENT

                yield console.log('putting appointment to database from scheduleSaga:');
                // UDPDATE THE DATABASE WITH UPDATED EVENT
                yield put({
                    type: SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE,
                    payload: updatedEvent
                }) // END UPDATE THE DATABASE WITH UPDATED EVENT
            }
        } // END CASE: EVENT BEFORE MOVED EVENT IN PREVIOUS ARRAY EXISTS

        // INITIATE RE-RENDER OF UPDATED EVENTS
        yield console.log('Updating the scheduleReducer with updated events.');
        yield put({
            type: SCHEDULE_ACTIONS.SET_APPOINTMENTS_AFTER_DRAG_AND_DROP,
            payload: events
        }) // END INITIATE RE-RENDER OF UPDATED EVENTS
        endPageLoadingSpinner();
    } catch (error) {
        console.log('UPDATE UPON EVENT MOVE FAILED', error);
    }
}

function* scheduleSaga() {
    yield takeLatest(SCHEDULE_ACTIONS.GET_DRIVE_DATA, initiateGetDriveData);
    yield takeLatest(SCHEDULE_ACTIONS.GET_APPOINTMENTS_FROM_THIRDPARTY_API, getAppointmentsFromThirdPartyAPI);
    yield takeLatest(SCHEDULE_ACTIONS.PUT_APPOINTMENT_TO_DATABASE, putAppointmentToDataBase);
    yield takeLatest(SCHEDULE_ACTIONS.PUT_APPOINTMENTS_TO_THIRDPARTY_API, initiatePutAppointmentsToThirdPartyAPI);
    yield takeLatest(SCHEDULE_ACTIONS.UPDATE_CURRENT_DATE, updateCurrentDate);
    yield takeLatest(SCHEDULE_ACTIONS.UPDATE_EVENTS_UPON_MOVE, updateEventsUponMove);
}

export default scheduleSaga;