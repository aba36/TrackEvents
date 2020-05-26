/**
 ** 
 **  Executable Name: test02.js
 **          Creator: Jacob Solomon
 **    Creation Date: 24-May-2020
 **      Modified By:
 **    
 **  DESCRIPTION:
 **
 **    This benchmark executes concurrently event put() and count()
 **    operations using JavaScript timers. It represents worst
 **    case performance scenario. See (1) below for further details.
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
 **
 **     Test was run with maximum event put() rate & 1 second count(1)
 **     repeated every second for a duration of 300 seconds.
 **
 **      1.4 million events per second processing rate
 **      process memory resident size: 42MB stable
 **      CPU utilization: 100% (consumed a single core)
 **
 **
 **  LIMITATIONS & ASSUMPTIONS:
 **
 ** 1) Node js (i.e. JavaScript) is single threaded, asynchronous, which
 **     blocks during loop operations of execute ready code. In test01.js
 **     a for loop was used to generate the events, preventing concurrent
 **     execution of the count() method.
 **     To work around this problem, timers are utilized to enable concurrent
 **     executions of event put() and count() methods.
 **
 **         For maximum event processing throughput, event put() operation
 **         is queued using setImmediate.
 **
 **         setImmediate - callback function is processed at the end of
 **             this turn of the Node.js Event Loop. When an immediate timer
 **             is queued from inside an executing callback, that timer will
 **             not be triggered until the next event loop iteration. As a
 **             result we will execute an event every Nodejs loop iteration.
 **
 **         setTimeout - will be used to execute count(num) operation on
 **             per second multiples, i.e. no more than one a second.
 **
 ** 2) This benchmark can run for extended period of time to measure the
 **     script's memory resident size to ensure there are no memory leaks.
 **     In addition, CPU utilization can be monitored to verify that CPU
 **     is utilization is efficient.
 **
 ** 3) Benchmark Global Variables Settings:
 **
 **     rum_time - the number of seconds to execute the test. It can be set
 **         for a long time, while monitoring OS memory & CPU utilization
 **         to verify that there is no memory leaks and efficient CPU use.
 **
 **     count_time - how often to execute count(). It is in milliseconds
 **         and needs to be incrimented by whole seconds value.
 ** 
 **     count_num - this is the value to pass to count(count_num). It
 **         specifies to count() over how many seconds to tally the events.
 ** 
 ************************************************************************************/

'use strict';

// Global Variables Settings:
let run_time = 5; // the number of seconds the benchmark should execute
let count_time = 1000; // millisecond time, how often to exectur count()
let count_num = 1; // number of seconds to count(count_num) over


const TrackEvents = require('./track_events');

const {performance} = require('perf_hooks');

let track = new TrackEvents();

function runCount() {

  const sec = Math.floor(performance.now()/1000);
  if(sec > run_time){
      console.log('\nEND: count()......');
     return;
  }

  let cnt = track.count(count_num);

  console.log(`sec: ${sec} - count-interval=${count_num} - total-events=${cnt}`)
  
  setTimeout(runCount, count_time);
}

function runPush(){
    const sec = Math.floor(performance.now()/1000);
    if(sec > run_time){
        console.log('\nEND: push().....');
        return;
    }

    track.push();

    setImmediate(runPush);
}

setImmediate(runPush);

setTimeout(runCount, count_time);