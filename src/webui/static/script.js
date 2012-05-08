Mesos = {
  Views: {}, // Backbone.js View classes
  Partials: {
    details:    _.template($("#partial-details").html()),
    frameworks: _.template($("#partial-frameworks").html()),
    slaves:     _.template($("#partial-slaves").html()),
    history:    _.template($("#partial-history").html()),
  } // Underscore templates we are using for subsets of the page
};

// Home view -- the dashboard
Mesos.Views.HomeView = Backbone.View.extend({
  template: _.template($("#template-root").html()),
  initialize: function() {
    $(document.body).bind('data_updated', this.update);
  },
  render: function() {
    $(this.el).html(this.template({})); // renders the empty page, not populated by data
    this.update();
  },
  update: function() {
    if (Mesos.state) {
      $('[data-slot=details]').html(Mesos.Partials.details({state: Mesos.state}));
      $('[data-slot=frameworks]').html(Mesos.Partials.frameworks({state: Mesos.state}));
      $('[data-slot=slaves]').html(Mesos.Partials.slaves({state: Mesos.state}));
      $('[data-slot=history]').html(Mesos.Partials.history({state: Mesos.state}));
    }
  }
});

// Frameworks List -- lists out all active frameworks
Mesos.Views.FrameworksListView = Backbone.View.extend({
  render: function() {
    $(this.el).html('This would be a list of frameworks'); // TODO
  }
});

// Frameworks List -- lists out all active frameworks
Mesos.Views.FrameworkView = Backbone.View.extend({
  render: function() {
    $(this.el).html('This would be a page for the framework with ID ' + this.model); // TODO
  }
});


// Request routing
Mesos.Router = Backbone.Router.extend({
  routes: {
    '': 'getHome',
    'frameworks': 'getFrameworkList',
    'frameworks/:id': 'getFramework'
  },
  getHome: function() {
    new Mesos.Views.HomeView({ el: $("#main_content") }).render();
  },
  getFrameworkList: function() {
    new Mesos.Views.FrameworksListView({ el: $("#main_content") }).render();
  },
  getFramework: function(id) {
    console.log(id)
    
    new Mesos.Views.FrameworkView({ el: $('#main_content'), model: id }).render();
  }
});
Mesos.router = new Mesos.Router;
Backbone.history.start();

Mesos.resources = {
  total_cpus: 0,
  total_mem: 0,
  running_cpus: 0,
  running_mem: 0
};

// Loop to update our state & derivative data:
var update_data = function() {
  $.getJSON('/master/state.json', function(state) {
    Mesos.state = state;

    Mesos.resources = {
      total_cpus: 0,
      total_mem: 0,
      running_cpus: 0,
      running_mem: 0
    };

    _.each(state.slaves, function(slave) {
      Mesos.resources.total_cpus += slave.resources.cpus;
      Mesos.resources.total_mem += slave.resources.mem;
    });

    _.each(state.frameworks, function(framework) {
      Mesos.resources.running_cpus += framework.resources.cpus;
      Mesos.resources.running_mem += framework.resources.mem;
    });

    $(document.body).trigger('data_updated');
    setTimeout('update_data()', 2000);
  });
};
update_data();





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
  var result = y + '-' + m + '-' + d + ' ' + h + ':' + n + ':' + s;
  return result;
}

