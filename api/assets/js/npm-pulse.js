angular.module('npm-pulse', ['ngRoute']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:IndexCtrl, templateUrl:'/templates/index.html'}).
      otherwise({redirectTo:'/'});
  });
 
function IndexCtrl($scope) {
  
}
 