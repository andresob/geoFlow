'use strict';

angular.module('geoFlow')
	.directive('graph', ['d3Service', function(d3Service) {
		return {
			restrict: 'EA',
			scope: {},
			link: function(scope, element, attrs) {
				d3Service.d3().then(function(d3) {

					var width = window.innerWidth - 100,
					    height = window.innerHeight -20;

					var color = d3.scale.ordinal()
					    .range(colorbrewer.RdYlBu[5]);

					var regions = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'C. Oeste'];

					var legend = d3.select('#legend')
					      .append('ul')
					       .attr('class', 'legend');

					var keys = legend.selectAll('li.key')
					    .data(color.range());

					keys.enter().append('li')
					    .attr('class', 'key')
					    .style('background-color', String);

					keys.append('span')
					    .attr('class', 'regions')
					    .text(function(d,i) { return regions[i]; });

					/*var tip = d3.tip()
					  .attr('class', 'd3-tip')
					  .offset([-10, 0])
					  .html(function(d) {
					    return '<span>' + d.n + ' | ' + d.s + '</span>';
					  });*/

					var svg = d3.select('[graph]').append('svg')
					    .attr('width', width)
					    .attr('height', height)
					    .attr('class', 'back-white');

					    svg.append('svg:defs').selectAll('marker')
					        .data(['end'])
					      .enter().append('svg:marker')
					        .attr('id', String)
					        .attr('viewBox', '0 -5 10 10')
					        .attr('refX', 15)
					        .attr('refY', -1.5)
					        .attr('markerWidth', 4)
					        .attr('markerHeight', 4)
					        .attr('orient', 'auto')
					      .append('svg:path')
					        .attr('d', 'M0,-5L10,0L0,5');

					var force = d3.layout.force()
					    .charge(-150)
					    .linkStrength(1)
					    .linkDistance( function(d) { return (d.v/200*2); } )
					    .gravity([1])
					    .size([width, height]);

					var flow, focus, total, unused, Link, Nodes, min = 5000, max = 219222;

					//svg.call(tip);

					load('1991');

					function load (filename) {

					  queue()
					    .defer(d3.json, 'app/data/graph/' + filename + '.json')
					    .await(ready);

					}

					function ready(error, graph) {

					  flow = graph;
					  Link = graph.links.filter(function(d) { return d.v > min && d.v < max; });
					  Nodes = graph.nodes;
					  drawGraph(Link, Nodes);

					}

					function rangeLinks (min, max, flow) {

					  Link = flow.links.filter(function(d) { return d.v > min && d.v < max; });
					  Nodes = flow.nodes;
					  d3.select('[graph] > svg > g').remove();
					  d3.selectAll('[graph] > svg > circle').remove();
					  drawGraph(Link, Nodes);

					}

					function drawGraph(linkValue, nodeValue ) {

					  force
					      .nodes(nodeValue)
					      .links(linkValue)
					      .start();

					  var link = svg.append('svg:g').selectAll('path')
					      .data(linkValue)
					    .enter().append('line')
					      .attr('class', 'link')
					      .style('stroke-width', function(d) { return Math.log(d.v)/4; })
					      .style('opacity', function(d) { return d.target.module ? 0.2 : 0.3; });

					  var node = svg.selectAll('.node')
					      .data(nodeValue)
					    .enter().append('circle')
					      .attr('class', 'node')
					      .attr('r', function(d) { return 2 * Math.sqrt(d.weight); })
					      .style('fill', function(d) { return color(d.g); })
					      //.on('mouseover', tip.show)
					      //.on('mouseout', tip.hide)
					      .call(force.drag)
					      .on('click', function(d) {
					          if (focus === d) {
					            force.charge(-150)
					                 .linkDistance( function(d) { return (d.v/200*2); } )
					                 .linkStrength(1)
					                 .start();

					            node.style('opacity', 1);
					            link.style('opacity', function(d) {
					                return d.target.module ? 0.6 : 0.1;
					            })
					            .attr('marker-end', 'none');
					            focus = false;
					          }
					          else {
					            focus = d;

					            node.style('opacity', function(o) {
					              o.active = connected(focus, o);
					              return o.active ? 1: 0.1;
					            });

					            force.charge(function(o) {
					                return (o.active ? -200 :-5);
					            }).linkDistance(function(l) {
					                return (l.source.active && l.target.active ? 140 : 20);
					            }).linkStrength(function(l) {
					                return (l.source === d || l.target === d ? 1 : 0);
					            }).start();

					            link.style('opacity', function(l) {
					                return l.source.active && l.target.active ? 0.2 : 0.02;
					            })
					            .attr('marker-end', 'url(#end)');
					          }
					      });

					  node.append('title')
					      .text(function(d) { return d.n; });

					  resize();
					  d3.select(window).on('resize', resize);

					  force.on('tick', function() {
					    link.attr('x1', function(d) { return d.source.x; })
					        .attr('y1', function(d) { return d.source.y; })
					        .attr('x2', function(d) { return d.target.x; })
					        .attr('y2', function(d) { return d.target.y; });

					    node.attr('cx', function(d) { return d.x; })
					        .attr('cy', function(d) { return d.y; });
					  });

					  total = flow.nodes.length;
					  unused = flow.nodes.filter(function(d) { return d.weight !== 0; }).length;

					}

					function resize() {
					  width = window.innerWidth;
					  height = window.innerHeight;
					  svg.attr('width', width)
					     .attr('height', height);
					  force
					     .resume();
					}

					function connected(s, t) {
					  return Link.filter( function(n) {
					    return (s === t) ||
					           (n.source === s && n.target === t) ||
					           (n.source === t && n.target === s);
					           }).length !== 0;
					}


					d3.select('.switch-label').on('click', function() {
					  var n = d3.selectAll('.node').filter(function(n) { return n.weight === 0; });
					  if (d3.select('.switch-label').classed('switchOff')) {
					    n.attr('r', '2');
					    d3.select('.switch-label').attr('class', 'switch-label switchOn');
					  }
					  else if (d3.select('.switch-label').classed('switchOn')) {
					    n.attr('r', function(d) { return 2 * Math.sqrt(d.weight); });
					    d3.select('.switch-label').attr('class', 'switch-label switchOff');
					  }
					});

					d3.select('.pick.nov').on('click', function() {
					  d3.selectAll('[graph] > svg > g').remove();
					  d3.selectAll('[graph] > svg > circle').remove();
					  max = 219222;
					  load('1991');
					});
					d3.select('.pick.zero').on('click', function() {
					  d3.selectAll('[graph] > svg > g').remove();
					  d3.selectAll('[graph] > svg > circle').remove();
					  max = 292331;
					  load('2000');
					});
					d3.select('.pick.dez').on('click', function() {
					  d3.selectAll('[graph] > svg > g').remove();
					  d3.selectAll('[graph] > svg > circle').remove();
					  max = 411922;
					  load('2010');
					});

				});
			}
		};
	}]);