'use strict';

var geoFlow = angular.module('geoFlow', [
	'ngRoute',
	'ngMaterial',
	'd3'
	]);


geoFlow.config(['$routeProvider', function($routeProvider) {

	$routeProvider
  		.when('/', {
    		templateUrl: 'app/main/main.html',
    		controller: 'MainController',
  		})
  		.otherwise({
    		redirectTo: '/'
  		});

}]);


geoFlow.config(['$logProvider', function($logProvider) {

	$logProvider.debugEnabled(true);

}]);

geoFlow.run(['$log', function($log){

	$log.debug('runBlock end');

}]);