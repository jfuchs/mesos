function metric_cpus(context) {
  return context.metric(function(start, stop, step, callback) {
    // Convert the start and stop "dates" into milliseconds.
    start = +start, stop = +stop;

    var values = [];
    _((stop - start) / step).times(function() {
      values.push(4);
    });

    // Return the data requested.
    callback(null, values);
  }, "cpus");
}


function metric_mem(context) {
  return context.metric(function(start, stop, step, callback) {
    // Convert the start and stop "dates" into milliseconds.
    start = +start, stop = +stop;

    var values = [];
    _((stop - start) / step).times(function() {
      values.push(34);
    });

    // Return the data requested.
    callback(null, values);
  }, "mem");
}
