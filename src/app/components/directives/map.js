'use strict';

angular.module('geoFlow')
	.directive('map', ['d3Service', function(d3Service) {
		return {
			restrict: 'EA',
			scope: {},
			link: function(scope, element, attrs) {
				d3Service.d3().then(function(d3) {

					var width = window.innerWidth -100,
					  	height = window.innerHeight;

					var projection = d3.geo.mercator();

					var path = d3.geo.path()
					  	.projection(projection);

					var svg = d3.select('[map]').insert('svg:svg')
					  	.attr('width', width - 50)
					  	.attr('height', height);

					var state = svg.append('svg:g')
					  	.attr('id', 'state');

					queue()
						.defer(d3.json, 'app/data/maps/brasil.topo.json' )
						.await(ready);

					function ready(error, collection, data) {

						var fit = topojson.feature(collection, collection.objects.states);

						projection
						    .scale(1)
						    .translate([0, 0]);

						var b = path.bounds(fit),
						    s = 0.55 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
						    t = [(width - 400 - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

						projection
						    .scale(s)
						    .translate(t);

						state.selectAll('path')
						    .data(topojson.feature(collection, collection.objects.states).features)
						  	.enter().append('svg:path')
						  	.attr('d', path);

					}

				});
			}
		};
	}]);