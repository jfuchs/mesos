$(function() {
  
  // Turn on scrollspy for the navbar:
  // $('#navbar').scrollspy();
  
  var details_template = _.template("\
  <dt>Server:</dt>\
  <dd><%= response['pid'] %></dd>\
  <dt>Built:</dt>\
  <dd><%= response['build_date'] %> (local?)</dd>\
  <dt>Started:</dt>\
  <dd><%= format_unix_timestamp_reasonably(response['start_time']) %> (UTC)</dd>\
  <dt>ID:</dt>\
  <dd><%= response['id'] %></dd>\
  ");
  
  var slaves_template = _.template("\
  <% _.each(response['slaves'], function(slave) { %>\
    <tr>\
      <td><a href=\"http://<%= slave['webui_hostname'] %>:<%= slave['webui_port'] %>/\"><%= slave['hostname'] %></a></td>\
      <td><%= slave['resources']['cpus'] %></td>\
      <td><%= slave['resources']['mem'] %></td>\
      <td><%= format_unix_timestamp_reasonably(slave['registered_time']) %></td>\
      <td><%= slave['id'] %></td>\
    </tr>\
  <% }); %>\
  ");
  
  $.getJSON('/static/fake/stats.json', function(data) {
    console.log(data);
    $('[data-slot=machine_details]').html(details_template({response:data}));
    $('[data-slot=slaves]').html(slaves_template({response:data}));
  });
  
});

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
