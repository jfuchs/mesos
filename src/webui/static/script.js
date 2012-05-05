
$(function() {

  var details_template = _.template("\
  <dl>\
    <dt>Server:</dt>\
    <dd><%= response['pid'] %></dd>\
    <dt>Built:</dt>\
    <dd><%= response['build_date'] %></dd>\
    <dt>Started:</dt>\
    <dd><%= response['start_time'] %></dd>\
    <dt>ID:</dt>\
    <dd><%= response['id'] %></dd>\
  </dl>");
  
  $.getJSON('/static/fake/stats.json', function(data) {
    console.log(data);
    $('#test_details').html(details_template({response:data}));
  });
  
});

