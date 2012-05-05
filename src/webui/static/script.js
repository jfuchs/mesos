
$(function() {
    // 
    // $.getJSON('http://localhost:5050/master/state.json', function(data) {
    //   alert(data);
    // });
  
  $.ajax({
    dataType: 'jsonp',
    // jsonp: 'jsonp_callback',
    url: 'http://localhost:5050/master/state.json',
    success: function () {
      alert('hi');
    },
  });
  
});

