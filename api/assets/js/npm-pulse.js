angular.module('npm-pulse', ['ngRoute']).
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


 