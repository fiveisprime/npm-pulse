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
};

var offsetDate = function(dateStr) {
  var _date = new Date(dateStr);
  var _helsenkiOffset = 2*60000;//maybe 3
  var _userOffset = _date.getTimezoneOffset()*60000;
  var _helsenkiTime = new Date(_date.getTime()+_helsenkiOffset+_userOffset);
  return _helsenkiTime;
};

npmPulse.directive('moduleDownloadVis', function() {
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function (scope, element, attrs) {
      var vis = d3.select(element[0]).append("svg");

      scope.$watch('val', function (newVal, oldVal) {

        if (!newVal) {
          return;
        }

        var project = newVal;

        nv.addGraph(function() {
          var chart = nv.models.lineChart();
          var opts = {};
          opts.margin = {left: 10, bottom: 0, right: 10, bottom: 0};
          opts.showXAxis = false;
          opts.showYAxis = false;
          opts.showLegend = false;
          opts.interactive = false;

          opts.x = function(d, i) {
            return offsetDate(d.key[1]);
          };
          opts.y = function(d, i) {
            return d.value;
          };

          opts.isArea = true;

          chart.options(opts);

          var data = {
            key : 'Downloads'
          , values : project.downloadsMonth.rows
          , color : '#008080'
          };

          d3.select(element[0]).select('svg')
             .datum([data])
           .transition().duration(20)
             .call(chart);

          nv.utils.windowResize(function() {
            d3.select(element[0]).select('svg').call(chart);
          });

          return chart;
        });
      });
    }
  };
});

npmPulse.directive('moduleContributors', function() {
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function (scope, element, attrs) {
      var vis = d3.select(element[0]).append("svg");

      scope.$watch('val', function (newVal, oldVal) {

        if (!newVal) {
          return;
        }

        var project = newVal;

        nv.addGraph(function() {
          var chart = nv.models.lineChart();
          var opts = {};
          opts.margin = {left: 20, bottom: 20, top: 20, bottom: 20};
          opts.showXAxis = false;
          opts.showYAxis = false;

          opts.x = function(d, i) {
            return new Date(d.key[1]);
          };
          opts.y = function(d, i) {
            return d.value;
          };

          chart.options(opts);

          chart.isArea = true;

          var data = {
            key : 'Downloads'
          , values : project.downloadsMonth.rows
          , color : '#2222ff'
          };

          d3.select(element[0]).select('svg')
             .datum(data)
           .transition().duration(20)
             .call(chart);

          nv.utils.windowResize(function() {
            d3.select(element[0]).select('svg').call(chart);
          });

          return chart;
        });
      });
    }
  };
});