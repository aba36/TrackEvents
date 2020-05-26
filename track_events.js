/**
 ** 
 **      File Name: track_events.js
 **    Module Name: TrackEvents
 **        Creator: Jacob Solomon
 **  Creation Date: 24-May-2020
 **    Modified By:
 **    
 **  DESCRIPTION:
 **    
 **    This lib is used for a high-rate event counter, can be a million-events/sec.
 **    To facilitate the high rate we keep the event count in memory, with a one
 **    second time resolution, and a 300 seconds history sliding window.
 **    
 **   USED BY:
 **    
 **    
 **  DEPENDENCIES:
 **    
 **    nodejs V8.11 or higher, but preferred V10 or higher
 **             This program was tested with: V8.11, V10.20 & V12.13
 **
 **    nodejs lib: perf_hooks
 **         Note: perf_hooks is supported since nodejs V8.5.0. This code was tested
 **               with node V8.11 and it worked just fine. Howerver, in V8.11
 **               performance.now() returns time in milliseconds since system boot
 **               time, while in V10 & V12 nodejs current process invokation time.
 **    
 **    
 **  METHODS:
 **    
        push() - every time it is called, the event counter will be incrimented by one.

        count(num) - return the number of events which occured over the past num seconds.

 **    
 **  LIMITATIONS & ASSUMPTIONS:
 **
 **  1) Will keep at most 5 minutes moving window of event counts.
 **
 **  2) Will keep count resolution to 1 second interfals. Will have a constant
 **     tally of 300 events count, one per second for total of 300 sec (5 minutes)
 **
 **  3) Will be optimized for very high event rate, e.g. 1 million-events/sec.
 **     This means, if we get 900K events during the first 0.9 second, followed
 **     by no events for 180 seconds, then followed by new events, the 180 list
 **     of data points will each have the value of the avarage of 900K/180
 **     However, this scenario should not be a problem since a high rate of
 **     events is expected each and every second.
 **
     4) The event counter needs to be peformant and efficient with respect to space
        and time complexities.

     5) performance.now() - from lib 'perf_hooks' will be used to get timestamp
        as it is the most performant with smallest overhead compared to:
        Date.now(), process.hrtime() and new Date().getTime()

        performance.now() returns the current high resolution sub-millisecond timestamp,
        where 0 represents the start of the current node process.

        Unlike Date.now(), the values returned by performance.now() always increase
        at a constant rate, independent of the system clock (which might be
        adjusted manually or skewed by software like NTP).

     6) Event counting - will be stored in a 300 element array, each element
        storing the number of events which occured during a particular second.
        The array will be managed in as a FIFO stack where a lates one second
        event count will be added to the end of the array followed by the removal
        of the element at the beginning of the array.

     7) Event count resultion - event count is provided in a single second resolution.
        Therefore:
        this._count - stores the last count which has not been stored in _this._arr
        yet. It will not used during event reporting, as it can skew the single second
        time resolution count by up to two seconds.

     8) shift() operations can be slow on large arrays. However, on a 300 element array
        performing 300 push shift operations was completed in about 80 microseconds,
        and since it is expcted to have on avarage a single shift operation per second
        switching to a queue will not improve performance measurably.
 **
 **
 **
 **
 ****************************************************************/

'use strict';

const {performance} = require('perf_hooks');

class TrackEvents{
    constructor(){
        this._count = 0;
        this._arr = [];

        this._last = performance.now();

        // initialize the array with count 0s
        for (let i=0; i < 300; i++){
            this._arr.push(0);
        }
    }

    // add event to counter
    push(){

        let pnow = performance.now();
        let diff = pnow - this._last;
        this._count++;

        if(diff < 1000){
            // keep counting, will store value no more than one per second
            return;
        }

        // we have one second worth of events count, update array

        // calculate the number of array elements to update
        // num represents the number of seconds elapsed since last array update
        let num = Math.floor(diff/1000);

        // this should never happy, but if for some obscure condition it does
        //  set num=1 since devide by zero will crash nodejs
        if (num === 0) num=1;

        // calculate the avarage events/second
        let avg = Math.floor(this._count/num);

        // if num >= 300 it means the previous event occured more than 5
        //  minutes ago, in that case will set all array values to zero
        if (num >= 300) avg = 0;

        for(let i=0; (i<num && i<300); i++){
            this._arr.push(avg);
            this._arr.shift();
        }

        // re-initialize counter and timestamp
        this._count = 0;
        this._last = pnow;
    }

    count(num){
        // if num is not an integer, undefined, or between 1 & 300, return -1
        if((Number.isInteger(num) === false) || num > 300 || num < 1){
            return(-1);
        }

        // Note: if elapsed (valuse returnd by Math.floor(...)) time since last event
        //       is greater than 300 seconds, range will be negative, in which case
        //       the return value will be zero
        let range = num - Math.floor((performance.now() - this._last)/1000);

        let total = 0;

        for (let i=299; range > 0 ; i--, range-- ){
            total += this._arr[i];
        }

        return(total);
        //return({'C-total=': total, 'C-_last=': Math.floor(this._last), 'C-num=': num});
    }
}

module.exports = TrackEvents;