angular.module('downloadFilters', []).filter('valueTotal', function() {
  return function(input) {
    var total = 0;
    for (var i = 0; i < input.length; i++) {
      total += input[i].value;
    }
    return total;
  };
});

function IndexCtrl($scope, $location) {
  $scope.getProject = function() {
    if ($scope.projectName) {
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
    if ($scope.projectName) {
      $location.path('/' + $scope.projectName);
    }
  };
}

var npmPulse = angular.module('npm-pulse', ['downloadFilters', 'ngRoute']).
factory('Projects', function($q, $timeout, $http) {
  var getProject = function(projectName) {

    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: '/api/' + projectName
    }).
    success(function(response) {
      document.querySelector('#spinner').style.display = 'none';

      if (response.fail) {
        return window.alert(response.error || 'Module not found.');
      }

      var downloads = response.downloadsMonth.rows,
        index = response.downloadsMonth.rows.length - 1;

      // Set the downloads count for the current month.
      response.downloadsCurrent = downloads.length > 0 ? downloads[index].value : 0;
      deferred.resolve(response);
    }).
    error(function() {
      document.querySelector('#spinner').style.display = 'none';
      window.alert('Something went wrong.');
    });

    return deferred.promise;
  };
  return {
    getProject: getProject
  };

})
  .config(function($routeProvider) {
    $routeProvider.
    when('/', {
      controller: IndexCtrl,
      templateUrl: '/templates/index.html'
    }).
    when('/:projectName', {
      controller: ProjectCtrl,
      templateUrl: '/templates/project.html'
    }).
    otherwise({
      redirectTo: '/'
    });
  });

var offsetDate = function(dateStr) {
  var _date = new Date(dateStr);
  var _helsenkiOffset = 2 * 60000; //maybe 3
  var _userOffset = _date.getTimezoneOffset() * 60000;
  var _helsenkiTime = new Date(_date.getTime() + _helsenkiOffset + _userOffset);
  return _helsenkiTime;
};

npmPulse.directive('moduleDownloadVis', function() {
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function(scope, element) {
      d3.select(element[0]).append('svg');

      scope.$watch('val', function(newVal) {

        if (!newVal) {
          return;
        }

        var project = newVal;

        nv.addGraph(function() {
          var chart = nv.models.lineChart();
          var opts = {};
          opts.margin = {
            left: 10,
            bottom: 0,
            right: 10
          };
          opts.showXAxis = false;
          opts.showYAxis = false;
          opts.showLegend = false;
          opts.interactive = false;

          opts.x = function(d) {
            return offsetDate(d.key[1]);
          };
          opts.y = function(d) {
            return d.value;
          };

          opts.isArea = true;

          chart.options(opts);

          var data = {
            key: 'Downloads',
            values: project.downloadsMonth.rows,
            color: '#008080'
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

npmPulse.directive('moduleContributorsVis', function() {
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function(scope, element) {
      d3.select(element[0]).append('svg');

      scope.$watch('val', function(newVal) {

        if (!newVal) {
          return;
        }

        var project = newVal;

        nv.addGraph(function() {
          var chart = nv.models.pieChart();

          var opts = {};

          opts.margin = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          };

          opts.x = function(d) {
            return d.author.login;
          };
          opts.y = function(d) {
            return d.total;
          };

          opts.color = d3.scale.category20c().range();

          opts.labelThreshold = 0.05;

          opts.showLegend = false;

          chart.options(opts);

          chart.donut(true);

          chart.tooltipContent(function(key, value) {
            return '<h3>' + key + '</h3>' +
              '<p>' + Math.round(value) + ' commits </p>';
          });

          d3.select(element[0]).select('svg')
            .datum(project.contributors)
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