/**
 **
 **      File Name: track_events.js
 **    Module Name: TrackEvents
 **        Creator: Jacob Solomon
 **  Creation Date: 24-May-2020
 **    Modified By: Jacob Solomon; 26-May-2020
 **    Modified By:
 **
 **  DESCRIPTION:
 **
 **    This lib is used as a high-rate event counter, million events/sec.
 **    To facilitate the high rate, the event count is memory resident,
 **    utilizing a one second time resolution, with a 300 seconds history
 **    sliding window to track past data. The data is not persistent.
 **
 **   USED BY:
 **
 **
 **  DEPENDENCIES:
 **
 **    nodejs V8.11 or higher, but preferred V10 or higher
 **             This program was tested with: V8.11, V10.20 & V12.13
 **             Operating systems tested on: Ubuntu, Windows 10, & Mac OS
 **
 **    nodejs lib: perf_hooks
 **         Note: perf_hooks is supported since nodejs V8.5.0. This code was
 **               tested with node V8.11 and it worked just fine. However,
 **               in V8.11 performance.now() returns time in milliseconds
 **               since system boot time, while in V10 & V12 nodejs current
 **               process invocation time.
 **
 **
 **  METHODS:
 **
 **           push() - every time it is called, the event counter is
 **                    incremented by one. No parameters or return values
 **                    are used.
 **
 **       count(num) - returns the number of events occurring over the past
 **                    num seconds.
 **
 **                              num - an integer between 1 & 300 inclusive,
 **                                    the event count time interval.
 **
 **                     return value - -1 if num is not between 1 & 300, else
 **                                     event count.
 **
 **
 **  LIMITATIONS & ASSUMPTIONS:
 **
 **  1) Will keep at most 300 seconds moving window of event counts.
 **
 **  2) Maintain count resolution to 1 second intervals.
 **
 **  3) Optimized for very high event rate, e.g. > 1 million-events/sec.
 **     This means, if we get 900K events during the first 0.9 second, followed
 **     by no events for 180 seconds, then followed by new events, the 180 list
 **     of data points will each have the value of the average of 900K/180
 **     However, this scenario should not be a problem since a high rate of
 **     events is expected each and every second.
 **
 **  4) The event counter needs to be performant and efficient with respect
 **     to space and time complexities.
 **
 **  5) performance.now() - from lib 'perf_hooks' will be used to get timestamp
 **     as it is the most performant with smallest overhead compared to:
 **     Date.now(), process.hrtime() and new Date().getTime()
 **
 **     performance.now() returns the current high resolution sub-millisecond
 **     timestamp, where 0 represents the start of the current node process.
 **
 **     Unlike Date.now(), the values returned by performance.now() always
 **     increase at a constant rate, independent of the system clock
 **     (which might be adjusted manually or skewed by software like NTP).
 **
 **  6) Event counting - will be stored in a 300 element array, each element
 **     representing a single second with a value which represents the
 **     number of events occurring during that particular second.
 **     The array will be managed as a FIFO stack where last second event
 **     count will pushed to the end of the array followed by the removal
 **     (shift()) of the first element of the array.
 **
 **  7) shift() operations can be slow on large arrays. However, on a 300
 **     element array, performing 300 push & shift operations was timed
 **     at about 80 microseconds, and since it is expected to have on average
 **     a single shift operation per second switching to a queue will not
 **     improve performance measurably. Using an array provides search
 **     performance benefit and ease of use over a queue.
 **
 **  8) Event count resolution - event count is provided in a single second
 **     resolution.
 **
 **     Therefore:
 **     this._count - stores the last count which has not been stored in
 **     _this._arr yet. It will not be used during event reporting, as it can
 **     skew the single second time resolution count by up to two seconds.
 **
 ************************************************************************/

'use strict';

const {performance} = require('perf_hooks');

class TrackEvents{
    constructor(){
        this._count = 0;
        this._arr = [];

        this._last = performance.now();

        // initialize the 300 element array with count 0
        for (let i=0; i < 300; i++){
            this._arr.push(0);
        }
    }

    // push() method adds event to counter
    push(){

        let pnow = performance.now();
        let diff = pnow - this._last;
        this._count++;

        if(diff < 1000){
            // keep counting, will store value no more than once a second
            return;
        }

        // we have one second worth of events count, update array

        // calculate the number of array elements to update
        // num represents the number of seconds elapsed since the
        // last array update
        let num = Math.floor(diff/1000);

        // this should never happy, but if for some obscure rounding error
        // it does set num=1 since divide by zero will crash nodejs
        if (num === 0) num=1;

        // calculate the average events/second
        let avg = Math.floor(this._count/num);

        // if num >= 300 it means the previous event occurred more than 5
        // minutes ago, in that case will set all array values to zero
        if (num >= 300) avg = 0;

        for(let i=0; (i<num && i<300); i++){
            this._arr.push(avg);
            this._arr.shift();
        }

        // re-initialize counter and timestamp
        this._count = 0;
        this._last = pnow;
    }

    // the method returning the number of events for the past num seconds
    count(num){
        // if num is not an integer, undefined, or between 1 & 300, return -1
        if((Number.isInteger(num) === false) || num > 300 || num < 1){
            return(-1);
        }

        // Note: if elapsed time since last event is greater than 300 seconds,
        //       range will be negative, and returned value will be zero
        //       i.e. the loop will not be executed.
        let range = num - Math.floor((performance.now() - this._last)/1000);

        let total = 0;

        for (let i=299; range > 0 ; i--, range-- ){
            total += this._arr[i];
        }

        return(total);
    }
}

module.exports = TrackEvents;