var context = cubism.context()
    .step(1000)
    .size(600);

d3.select("#graph").selectAll(".axis")
    .data(["top", "bottom"])
  .enter().append("div")
    .attr("class", function(d) { return d + " axis"; })
    .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

d3.select("#graph").append("div")
    .attr("class", "rule")
    .call(context.rule());

d3.select("#graph").selectAll(".horizon")
    .data([metric_cpus(), metric_mem()])
  .enter().insert("div", ".bottom")
    .attr("class", "horizon")
    .call(context.horizon().extent([0, 100]));

context.on("focus", function(i) {
  d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
});


function metric_cpus() {
  return context.metric(function(start, stop, step, callback) {
    // Convert the start and stop "dates" into milliseconds.
    start = +start, stop = +stop;

    var values = [];
    _((stop - start) / step).times(function() {
      values.push(Mesos.resources.running_cpus);
    });

    // Return the data requested.
    callback(null, values);
  }, "cpus");
}

function metric_mem() {
  return context.metric(function(start, stop, step, callback) {
    // Convert the start and stop "dates" into milliseconds.
    start = +start, stop = +stop;

    var values = [];
    _((stop - start) / step).times(function() {
      values.push(Mesos.resources.running_mem);
    });

    // Return the data requested.
    callback(null, values);
  }, "mem");
}
