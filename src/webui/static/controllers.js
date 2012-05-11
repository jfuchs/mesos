'use strict';


// Main controller that can be used to handle "global" events. E.g.,:
//     $scope.$on('$afterRouteChange', function() { ...; });
//
// In addition, the MainCntl encapsulates the "view", allowing the
// active controller/view to easily access anything in scope (e.g.,
// the state).
function MainCntl($scope, $http, $route, $routeParams, $location, $defer) {

  $scope.$location = $location;
  $scope.delay = 2000;
  $scope.retry = 0;

  var poll = function() {
    $http.get('master/state.json')
      .success(function(data) {
        $scope.state = data;
        $.event.trigger('state_updated');
        $scope.delay = 2000;
        $defer(poll, $scope.delay);
      })
      .error(function(data) {
        if ($scope.delay >= 32000) {
          $scope.delay = 2000;
        } else {
          $scope.delay = $scope.delay * 2;
        }
        $scope.retry = $scope.delay;
        function countdown() {
          if ($scope.retry == 0) {
            $('#error-modal').modal('hide');
          } else {
            $scope.retry = $scope.retry - 1000;
            $scope.countdown = $defer(countdown, 1000);
          }
        }
        countdown();
        $('#error-modal').modal('show');
      });
  }

  // Make it such that everytime we hide the error-modal, we stop the
  // countdown and restart the polling.
  $('#error-modal').on('hidden', function () {
    if ($scope.countdown != undefined) {
      if ($defer.cancel($scope.countdown)) {
        $scope.delay = 2000; // Restart since they cancelled the countdown.
      }
    }

    // Start polling again, but do it asynchronously (and wait at
    // least a second because otherwise the error-modal won't get
    // properly shown).
    $defer(poll, 1000);
  });

  poll();
}

function HomeCtrl($scope) {
  setNavbarActiveTab('home');
}

function DashboardCtrl($scope) {
  setNavbarActiveTab('dashboard');
  
  // TODO(benh): I'm pretty sure this creates a new cubism context
  // each time. Either delete this context, or store the context
  // globally so that it can be referenced.
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
    .data([metric_cpus(context), metric_mem(context)])
    .enter().insert("div", ".bottom")
    .attr("class", "horizon")
    .call(context.horizon().extent([0, 100]));

  context.on("focus", function(i) {
    d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
  });
}

function FrameworksCtrl($scope) {
  setNavbarActiveTab('frameworks');
  
}

function FrameworkCtrl($scope, $routeParams) {
  setNavbarActiveTab('frameworks');
  
  $scope.id = $routeParams.id;
  
  var fetchFramework = function() {
    if ($scope.state && $scope.state.frameworks) {
      // TODO(jfuchs) this is an O(n) lookup for our framework. If we restructured the state JSON
      // to store frameworks as a dict instead of an array, we could make the framework lookup
      // faster.
      $scope.framework = _($scope.state.frameworks).find(function(framework) {
        return framework.id == $scope.id
      }, this);
    }
  }
  fetchFramework();
  $(document).on('state_updated', fetchFramework);
  $scope.$on('$beforeRouteChange', function() {
    $(document).off('state_updated', fetchFramework);
  });
  
}
