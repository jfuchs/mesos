$(function() {
  
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

  var frameworks_template = _.template("\
  <% _.each(response['frameworks'], function(framework) { %>\
    <tr>\
      <td><%= framework['id'] %></td>\
      <td><%= framework['user'] %></td>\
      <td><%= framework['name'] %></td>\
      <td><%= framework['tasks'].length %></td>\
      <td><%= framework['resources']['cpus'] %></td>\
      <td><%= framework['resources']['mem'] %></td>\
      <td>TODO</td>\
      <td><%= format_unix_timestamp_reasonably(framework['registered_time']) %></td>\
      <td><%= format_unix_timestamp_reasonably(framework['reregistered_time']) %></td>\
    </tr>\
  <% }); %>\
  ");
  
  var slaves_template = _.template("\
  <% _.each(response['slaves'], function(slave) { %>\
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
  <% _.each(response['completed_frameworks'], function(history) { %>\
    <tr>\
      <td><%= history['id'] %></td>\
      <td><%= history['user'] %></td>\
      <td><%= history['name'] %></td>\
      <td><%= format_unix_timestamp_reasonably(history['registered_time']) %></td>\
      <td><%= format_unix_timestamp_reasonably(history['reregistered_time']) %></td>\
    </tr>\
  <% }); %>\
  ");
  
  $.getJSON('/master/state.json', function(data) {
    $('[data-slot=machine_details]').html(details_template({response:data}));
    $('[data-slot=frameworks]').html(frameworks_template({response:data}));
    $('[data-slot=slaves]').html(slaves_template({response:data}));
    $('[data-slot=history]').html(history_template({response:data}));
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
