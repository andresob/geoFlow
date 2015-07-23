'use strict';

angular.module('geoFlow')
	.directive('satellite', ['d3Service', function(d3Service) {
		return {
			restrict: 'EA',
			scope: {},
			link: function() {
				d3Service.d3().then(function(d3) {

					var width = 960,
					    height = 960;

					var projection = d3.geo.satellite()
					    .distance(1.1)
					    .scale(5500)
					    .rotate([76.00, -34.50, 32.12])
					    .center([-2, 5])
					    .tilt(25)
					    .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6)
					    .precision(.1);

					var graticule = d3.geo.graticule()
					    .extent([[-93, 27], [-47 + 1e-6, 57 + 1e-6]])
					    .step([3, 3]);

					var path = d3.geo.path()
					    .projection(projection);

					var svg = d3.select('[satellite]').append('svg')
					    .attr('width', width)
					    .attr('height', height);

					svg.append('path')
					    .datum(graticule)
					    .attr('class', 'graticule')
					    .attr('d', path);

					d3.json('http://bl.ocks.org/mbostock/raw/4090846/us-land.json', function(error, us) {
					  if (error) throw error;

					  svg.append('path')
					      .datum(topojson.feature(us, us.objects.land))
					      .attr('class', 'boundary')
					      .attr('d', path);
					});

					d3.select(self.frameElement).style('height', height + 'px');

				});
			}
		};
	}]);