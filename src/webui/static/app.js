'use strict';

angular.module('mesos', []).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {template: 'static/home.html', controller: HomeCtrl})
      .when('/dashboard', {template: 'static/dashboard.html', controller: DashboardCtrl})
      .when('/frameworks', {template: 'static/frameworks.html', controller: FrameworksCtrl})
      .when('/framework/:id', {template: 'static/framework.html', controller: FrameworkCtrl})
      .otherwise({redirectTo: '/'});
  }]);
