## Event Tracker

### Description:

- An event tracker designed to process a high-rate of events,
  million events/sec. It is optimized with respect to space and time
  complexities. To facilitate the high rate, the event counter is memory
  resident, utilizing a one second time resolution, with a 300 seconds
  history sliding window to track past events. The data is not persistent.

- For additional information, including usage, see the self-documented scripts.


### Files/scripts description:

##### The node js tracking module:

- track_events.js - the library



##### Testing scenarios:

- test01.js - self-contained synthetic test designed to measure
    the maximum raw throughput event processing power of the
    underlying HW.

- test02.js - self-contained test designed to measure
    a realistic testing scenario.
