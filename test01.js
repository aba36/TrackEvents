/**
 ** 
 **  Executable Name: test01.js
 **          Creator: Jacob Solomon
 **    Creation Date: 24-May-2020
 **      Modified By: Jacob Solomon; 26-May-2020
 **      Modified By:
 **    
 **  DESCRIPTION:
 **
 **   This test is designed to measure the maximum raw throughput event
 **   processing power of the underlying HW. While it is a synthetic test,
 **   and doesn't represent a "real-life" scenario, it is useful in determining
 **   the top performance of an underlying HW. Furthermore, this test provides a
 **   sanity check to ensure that the loop iteration count is equal the number
 **   of events registered. Also the count() function is tested, see limitations
 **   & assumptions for further details.
 **
 **
 **  The test was performed on the following HW:
 **  Tested Hardware:
 **      Dell: PowerEdge 330 server
 **       CPU: Intel Xeon E3-1240 v6 3.75GHz, 8M cache, 4C/8T, turbo
 **    Memory: 16GB
 **        OS: Ubuntu 16.04.4 LTS
 **    nodejs: v10.20.1
 **
 **  Performance results:
 **      22 million events per second processing rate.
 **
 **
 **  LIMITATIONS & ASSUMPTIONS:
 **
 ** 1) Benchmark Global Variables Settings:
 **
 **    loop_count - defines the number of events to generate. 80M iteration
 **      takes about 3.5 seconds to complete on the Dell server. This target
 **      number can be increased, however, if it is made too large and the
 **      test runs over 300 seconds the computed results will not be accurate
 **      since loop_count specifies the total number of events to generate,
 **      but the event tracker tracks only a 300 seconds moving window.
 **
 **    delay_milliseconds - the number of milliseconds to delay the calling of
 **      event count(). It represents the delay in time since the last event was 
 **      processed. It is used to simulate a testing scenario with zero events
 **      when calling the count(num) method.
 **
 **      Examples: if delay_milliseconds=2000 (2 sec delay) and
 **      count_seconds=1 then the event count() result should be zero 
 **      since there were no events in the seconds passed the last event
 **      processed. If delay_milliseconds=0 & count_secnods=1 then event
 **      count() should equal the last event tally, and so on. If
 **      delay_milliseconds=2 and count_seconds=5, then the tally would be
 **      zero for the two seconds past the last event plus the sum of 3 seconds
 **      of the tail end of the events.
 **
 **    count_seconds - defines the number of seconds count() will return.
 **      count(num) num equals the value set by count_seconds and can be a
 **      number between 1 & 300 seconds. It represents events count over the
 **      time interval specified in seconds.
 ** 
 ** 
 ************************************************************************************/



'use strict';

const TrackEvents = require('./track_events');

const {performance} = require('perf_hooks');


let loop_count = 80000000;
let delay_milliseconds = 0;
let count_seconds = 1;

let track = new TrackEvents();

let start = performance.now();

// Generate the events
for (let i=0; i < loop_count; i++){
    track.push();
}
let end = performance.now();


// Report the results

let second = 1;
let total = 0;
let tmp;

console.log('\nTest results summary')
console.log('====================\n')

console.log('Event tally by second:')
for (let i=0; i < track._arr.length; i++){
    tmp = track._arr[i];
    if (tmp === 0){
        continue;
    }

    total += tmp;

    console.log(`Second ${second} count: ${tmp}`);
    second++;
}

console.log(`Last fraction of second count: ${track._count}\n`);

total += track._count;

console.log(`Total number of events: ${total}`);
console.log(`Total loop iterations: ${loop_count}`);

if (total === loop_count){
    console.log(`Passed test: loop iterations === events\n`);
}
else{
    console.log(`Failed test: loop iterations !== events\n`);

}

tmp = Math.floor(end - start);

console.log('\nRaw insert events performance:')
console.log(`Test duration=${tmp} milliseconds`)
console.log(`Events per second=${Math.floor((total/tmp)*1000)}`)

function count_events(){
    let i = track.count(count_seconds);
    console.log(`\ncount() events over last seconds=${count_seconds}, delay_milliseconds=${delay_milliseconds} `)
    console.log(`Total count=${i}`);
}

setTimeout(count_events, delay_milliseconds);