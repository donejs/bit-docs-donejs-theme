/* global moment */
import { connect } from "can";

const eventConnection = connect(
    [ connect.constructor, connect.dataUrl ],
    { url: "https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events?key={apiKey}" }
);

eventConnection.getList( {} ).then( function( events ) {
  console.log(events);
} );

/*
export const Event = can.Model.extend({
  findAll: 'GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events?key={apiKey}',
  parseModels: function(data, xhr) {
    return data && data.items;
  }
}, {
  define: {
    startTimestamp: {
      get: function() {
        var start = this.attr('start');
        if (!start || !start.attr) {
          return 0;
        }
        var startDateTime = start.attr('dateTime') || start.attr('date');
        return moment(startDateTime).format('X');
      },
      serialize: true
    }
  }
});

export default Event;
*/
