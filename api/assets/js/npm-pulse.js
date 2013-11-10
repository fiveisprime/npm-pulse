var npmPulse = angular.module('npm-pulse', ['ngRoute']).
  factory('Projects', function($q, $timeout) {
    var getProject = function(projectName) {

      var deferred = $q.defer();

      window.socket.get("/api/" + projectName, function (response) {

        if (response) {
          console.log(response);
          deferred.resolve(response);
        } else {
          //deferred.reject('Greeting ' + name + ' is not allowed.');
          window.alert('Project Not Found');
        }

      });

      return deferred.promise;
    };
    return {
      getProject: getProject
    };

  })
  .config(function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {controller:IndexCtrl, templateUrl:'/templates/index.html'}).
      when('/:projectName', {controller:ProjectCtrl, templateUrl:'/templates/project.html'}).
      otherwise({redirectTo:'/'});
  });

function IndexCtrl($scope, $location) {
  $scope.getProject = function() {
    if($scope.projectName){
      $location.path('/' + $scope.projectName);
    }
  };
}


function ProjectCtrl($scope, $location, $routeParams, Projects) {

  var projectName = $routeParams.projectName;

  Projects.getProject(projectName).then(function(response) {
    $scope.project = response;
  });

  $scope.getProject = function() {
    if($scope.projectName){
      $location.path('/' + $scope.projectName);
    }
  };

}

npmPulse.directive('moduleDownloadVis', function() {

  var margin = 20,
    width = 960,
    height = 500 - .5 - margin,
    color = d3.interpolateRgb("#f77", "#77f");

  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function (scope, element, attrs) {
      console.log('download vis');
      console.log(element[0]);

      var vis = d3.select(element[0])
        .append("svg")
          .attr("width", width)
          .attr("height", height + margin + 100);

      scope.$watch('val', function (newVal, oldVal) {
        console.log('vis value set');

        if (!newVal) {
          return;
        }
      });
    }
  };
});