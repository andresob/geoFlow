'use strict';

angular.module('geoFlow')
	.directive('map', ['d3Service', function(d3Service) {
		return {
			restrict: 'EA',
			scope: {},
			link: function() {
				d3Service.d3().then(function(d3) {

					var width = window.innerWidth,
					  	height = window.innerHeight,
						centered;

					var projection = d3.geo.mercator();

					var path = d3.geo.path()
					  	.projection(projection);

					var svg = d3.select('[map]').insert('svg:svg')
					  	.attr('width', width)
					  	.attr('height', height);

					var state = svg.append('svg:g')
					  	.attr('id', 'state');

					queue()
						.defer(d3.json, 'app/data/maps/brasil.topo.json' )
						.await(ready);

					//drawing map
					function ready(error, collection) {

						var fit = topojson.feature(collection, collection.objects.states);

						projection
						    .scale(1)
						    .translate([0, 0]);

						var b = path.bounds(fit),
						    s = 0.85 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
						    t = [(width - 400 - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

						projection
						    .scale(s)
						    .translate(t);

						state.selectAll('path')
						    .data(topojson.feature(collection, collection.objects.states).features)
						  	.enter().append('svg:path')
						  	.attr('d', path)
							.attr('class','states')
							.on('click', clicked);
					}

					//zoomable function
					function clicked(d)
				    {
						var x, y, k;

						if (d && centered !== d)
						{
							var centroid = path.centroid(d);
							x = centroid[0];
							y = centroid[1];
							k = 2.5;
							centered = d;
						}
					   	else
						{
							x = width / 4;
							y = height / 2;
							k = 1;
							centered = null;
						}

						state.selectAll('path')
						    .classed('active', centered && function(d) { return d === centered; });

						state.transition()
						    .duration(750)
						    .attr('transform', 'translate(' + width / 4 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
						    .style('stroke-width', 1.5 / k + 'px');
					}

				});
			}
		};
	}]);