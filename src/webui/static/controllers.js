'use strict';

// Main controller that can be used to handle "global" events. E.g.,:
//     $scope.$on('$afterRouteChange', function() { ...; });
//
// In addition, the MainCntl encapsulates the "view", allowing the
// active controller/view to easily access anything in scope (e.g.,
// the state).
function MainCntl($scope, $http, $route, $routeParams, $location, $defer) {

  $scope.$location = $location;

  var update = function() {
    $http.get('master/state.json')
      .success(function(data) {
        $scope.state = data;
        $('#error-modal').modal('hide');
      })
      .error(function(data) {
        $('#error-modal').modal('show');
      });
    $defer(update, 2000);
  }
  update();
}


function HomeCtrl($scope) {

}


function DashboardCtrl($scope) {
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

 // Do any cleanup before we change the route.
  $scope.$on('$beforeRouteChange', function() { });
}


function FrameworksCtrl($scope) {
}


function FrameworkCtrl($scope, $routeParams) {
  $scope.id = $routeParams.id;
}
