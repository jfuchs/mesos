// TODO: find a decent date parsing library
function format_unix_timestamp_reasonably(ts) {
  var date = new Date(ts * 1000);
  // going for: YYYY-M-D H:M:S (with 24h HH)
  var y = date.getUTCFullYear();
  var m = date.getUTCMonth() + 1;
  var d = date.getUTCDate();
  var h = date.getUTCHours();
  var n = date.getUTCMinutes();
  var s = date.getUTCSeconds();
  
  // var result = [y,m,d].join('-') + ' ' + [h,n,s].join(':');
  var result = y + '-' + m + '-' + d + ' ' + h + ':' + n + ':' + s;
  return result;
}


var resources = {
  total_cpus: 0,
  total_mem: 0,
  running_cpus: 0,
  running_mem: 0
};


var update = function() {
  
  var details_template = _.template("\
  <dt>Server:</dt>\
  <dd><%= state['pid'].split(\"@\")[1] %></dd>\
  <dt>Built:</dt>\
  <dd><%= state['build_date'] %> (local?)</dd>\
  <dt>Started:</dt>\
  <dd><%= format_unix_timestamp_reasonably(state['start_time']) %> (UTC)</dd>\
  <dt>ID:</dt>\
  <dd><%= state['id'] %></dd>\
  ");

  var frameworks_template = _.template("\
  <% _.each(state['frameworks'], function(framework) { %>\
    <tr>\
      <td><%= framework['id'] %></td>\
      <td><%= framework['user'] %></td>\
      <td><%= framework['name'] %></td>\
      <td><%= framework['tasks'].length %></td>\
      <td><%= framework['resources']['cpus'] %></td>\
      <td><%= framework['resources']['mem'] %></td>\
      <td>TODO</td>\
      <% var registered_time = new Date(framework['registered_time'] * 1000);\
         var reregistered_time = new Date(framework['reregistered_time'] * 1000);\
      %>\
      <td><%= registered_time.toLocaleString() %></td>\
      <td><%= registered_time.getTime() == reregistered_time.getTime() ? '' : reregistered_time.toLocaleString() %></td>\
    </tr>\
  <% }); %>\
  ");
  
  var slaves_template = _.template("\
  <% _.each(state['slaves'], function(slave) { %>\
    <tr>\
      <td>\
        <a href=\"http://<%= slave['webui_hostname'] %>:<%= slave['webui_port'] %>/\">\
          <%= slave['hostname'] %>\
        </a>\
      </td>\
      <td><%= slave['resources']['cpus'] %></td>\
      <td><%= slave['resources']['mem'] %></td>\
      <td><%= format_unix_timestamp_reasonably(slave['registered_time']) %></td>\
      <td><%= slave['id'] %></td>\
    </tr>\
  <% }); %>\
  ");
  
  var history_template = _.template("\
  <% _.each(state['completed_frameworks'], function(history) { %>\
    <tr>\
      <td><%= history['id'] %></td>\
      <td><%= history['user'] %></td>\
      <td><%= history['name'] %></td>\
      <% var registered_time = new Date(history['registered_time'] * 1000);\
         var reregistered_time = new Date(history['reregistered_time'] * 1000);\
      %>\
      <td><%= registered_time.toLocaleString() %></td>\
      <td><%= registered_time.getTime() == reregistered_time.getTime() ? '' : reregistered_time.toLocaleString() %></td>\
    </tr>\
  <% }); %>\
  ");
  
  $.getJSON('/master/state.json', function(state) {
    $('[data-slot=details]').html(details_template({state: state}));
    $('[data-slot=frameworks]').html(frameworks_template({state: state}));
    $('[data-slot=slaves]').html(slaves_template({state: state}));
    $('[data-slot=history]').html(history_template({state: state}));

    // Update the total cpus and memory in use.
    resources.total_cpus = 0;
    resources.total_mem = 0;

    _.each(state['slaves'], function(slave) {
      resources.total_cpus += slave['resources']['cpus'];
      resources.total_mem += slave['resources']['mem'];
    });

    resources.running_cpus = 0;
    resources.running_mem = 0;

    _.each(state['frameworks'], function(framework) {
      resources.running_cpus += framework['resources']['cpus'];
      resources.running_mem += framework['resources']['mem'];
    });
  });

  setTimeout("update()", 2000);
}

$(function() { update(); });


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
      values.push(resources.running_cpus);
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
      values.push(resources.running_mem);
    });

    // Return the data requested.
    callback(null, values);
  }, "mem");
}
