Mesos = {
  Views: {}, // Backbone.js View classes
  Partials: {
    details:          _.template($("#partial-details").html()),
    frameworksTable:  _.template($("#partial-frameworks-table").html()),
    slavesTable:      _.template($("#partial-slaves-table").html()),
    historyTable:     _.template($("#partial-history-table").html()),
    frameworkDetails: _.template($("#partial-framework-details").html()),
    tasksTable:       _.template($("#partial-tasks-table").html()),
  } // Underscore templates we are using for subsets of the page
};

// Present a home view.
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
      $('[data-slot=frameworks]').html(Mesos.Partials.frameworksTable({state: Mesos.state}));
      $('[data-slot=slaves]').html(Mesos.Partials.slavesTable({state: Mesos.state}));
      $('[data-slot=history]').html(Mesos.Partials.historyTable({state: Mesos.state}));
    }
  }
});

// List several frameworks.
Mesos.Views.FrameworksListView = Backbone.View.extend({
  template: _.template($("#template-frameworks-list").html()),
  initialize: function() {
    $(document.body).bind('data_updated', this.update);
  },
  render: function() {
    $(this.el).html(this.template({}));
    this.update();
  },
  update: function() {
    if (Mesos.state) {
      $('[data-slot=frameworks]').html(Mesos.Partials.frameworksTable({state: Mesos.state}));
    }
  }
});

// Show detail of a specific framework.
Mesos.Views.FrameworkView = Backbone.View.extend({
  template: _.template($("#template-framework").html()),
  initialize: function() {
    _(this).bindAll(['update']);
    $(document.body).bind('data_updated', this.update);
  },
  render: function() {
    $(this.el).html(this.template({id:this.id}));
    this.update();
  },
  update: function() {
    if (Mesos.state) {
      var framework = _(Mesos.state.frameworks).find(function(framework) { return framework.id == this.id }, this);
      if (framework) {
        $('[data-slot=running-tasks-table]').html(Mesos.Partials.tasksTable({tasks:framework.tasks}));
        $('[data-slot=completed-tasks-table]').html(Mesos.Partials.tasksTable({tasks:framework.completed_tasks}));
        $('[data-slot=framework-details]').html(Mesos.Partials.frameworkDetails(framework));
      }
    }
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
    new Mesos.Views.FrameworkView({ el: $('#main_content'), id: id }).render();
  }
});
Mesos.router = new Mesos.Router;
$(function() {
  Backbone.history.start();
});

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

