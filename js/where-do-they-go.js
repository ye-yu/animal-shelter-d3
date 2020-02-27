"use strict";

function whereDoTheyGo() {
  let containerWidth=$('#wdtg-container').width();
  let containerHeight=containerWidth*0.5;

  let svg = d3.select('svg#wdtg-graph');
  let legend = d3.select('svg#wdtg-legend');

  let xCoverage=0.95;
  let yCoverage=0.95;
  let graphDimension={
    offsetTop:60
  };

  graphDimension.width= containerWidth * xCoverage;
  graphDimension.height= (containerHeight - graphDimension.offsetTop) * yCoverage;
  graphDimension.marginX= 0.5*(containerWidth - graphDimension.width);
  graphDimension.marginY= 0.5*(containerHeight - graphDimension.height);

  /* set the size of the svg */
  svg.attr('width', `${containerWidth}px`)
     .attr('height', `${containerHeight}px`);

  let wdtgEvents = {
    selectedMovements: []
  };

  console.log(graphDimension);

  /* set title of the graph */
  svg.append('text')
     .attr('class', 'vis-title h5')
     .attr('text-anchor', 'middle')
     .attr('x', `${containerWidth/2}px`)
     .attr('y', `${graphDimension.offsetTop / 2}px`)
     .text("Parallel Linked Heatmap of Animals' Movement");

     d3.json('movement.json').then(data => {
       /* get minimum and maximum values */
       let totals = tuplize(data)
       totals = totals.map(x => tuplize(x[1]).filter(x => x[0] !== 'Total'));
       totals = totals.reduce((a, b) => a.concat(b));
       totals = totals.map(x => x[1]['Total']);
       let min = d3.min(totals);
       let max = d3.max(totals)
       let colourScale = d3.scaleLog()
                           .domain([min, max])
                           .range([0.1, 0.35]);
       let heatmapColour = (domain) => d3.interpolateYlOrBr(colourScale(domain));

       /* create legend */
       let legendHeatmapAttr = {};
       legendHeatmapAttr.width = $('#wdtg-legend-container').width();
       legendHeatmapAttr.divisions = 200;
       legendHeatmapAttr.boxWidth = legendHeatmapAttr.width / legendHeatmapAttr.divisions;
       legendHeatmapAttr.boxHeight = 20;
       let legendScale = d3.scaleLinear().domain([0, legendHeatmapAttr.divisions-1]).range([min, max]);
       for(let i of range(legendHeatmapAttr.divisions)) {
         let boxFill = legendScale(i);
         boxFill = heatmapColour(boxFill);
         d3.select('svg#wdtg-heatmap-legend')
           .append('rect')
           .attr('class', 'heatmap-legend-box')
           .attr('x', `${i * legendHeatmapAttr.boxWidth}px`)
           .attr('y', `10px`)
           .attr('width', `${legendHeatmapAttr.boxWidth + 1}px`)
           .attr('height', `${legendHeatmapAttr.boxHeight}px`)
           .attr('fill', `${boxFill}`);
       }
       d3.select('svg#wdtg-heatmap-legend')
         .append('text')
         .style('font-size', '0.75em')
         .attr('class', 'vis-body')
         .attr('text-anchor', 'start')
         .attr('x', '0px')
         .attr('y', `${legendHeatmapAttr.boxHeight * 2 + 5}px`)
         .text(min);
       d3.select('svg#wdtg-heatmap-legend')
         .append('text')
         .style('font-size', '0.75em')
         .attr('class', 'vis-body')
         .attr('text-anchor', 'end')
         .attr('x', `${legendHeatmapAttr.width}px`)
         .attr('y', `${legendHeatmapAttr.boxHeight * 2 + 5}px`)
         .text(max);

       /* calculate boxes size */
       let nMovements = Object.keys(data).length;
       let movementToLinksRatio = 0.7;
       let movementContainer = {};

       movementContainer.width = graphDimension.width * movementToLinksRatio / nMovements;
       movementContainer.height = movementContainer.width * 0.35;

       let linksContainer = {};
       linksContainer.width = graphDimension.width - (movementContainer.width * nMovements);
       linksContainer.width /= (nMovements - 1);

       svg.selectAll('g:not(.svg-container)')
       	  .data(tuplize(data))
          .enter()
      	  .append('g')
          .attr('id', (d, i) => `movement-${i}-container`)
          .append('text')
          .attr('class', 'vis-body small')
          .attr('text-anchor', 'middle')
          .attr('y', `${graphDimension.marginY + graphDimension.offsetTop/3*2}px`)
          .attr('x', (d, i) => `${graphDimension.marginX + 0.5 * movementContainer.width + i * (movementContainer.width + linksContainer.width)}px`)
          .text(d => `${d[0]}\nMovement`)

       for(let {index, value} of enumerate(data)) {
         let nMovement = tuplize(data[value]).filter(x => x[0] !== 'Total').sort((a, b) => b[1]['Total'] - a[1]['Total']);
         let total = data[value]['Total'];

     	   let g = d3.select(`g#movement-${index}-container`);

         /* append each movement box */
         g.selectAll(`rect.movement-${index}-rect`)
          .data(nMovement)
          .enter()
          .append('rect')
          .attr('class', `movement-${index}-rect`)
          .attr('y', (d, i) => `${graphDimension.marginY + graphDimension.offsetTop + i*movementContainer.height	}px`)
          .attr('x', `${graphDimension.marginX + index * (movementContainer.width + linksContainer.width)}px`)
          .attr('width', `${movementContainer.width}px`)
          .attr('height', `${movementContainer.height - 3}px`)
          .attr('fill', d => `${heatmapColour(d[1]['Total'])}`)
          .attr('stroke', 'gray')
          .attr('stroke-width', '0px')
          .attr('selected', false)
          .style("pointer-events", "all")
          .on("click", function(d, i) {
            if (d3.select(this).attr('selected') == 'true') {
              d3.select(this)
                .attr('selected', false)
                .transition()
                .style('stroke-width', '0px');
            } else {
              d3.select(this)
                .attr('selected', true)
                .transition()
                .style('stroke-width', '2px');
            }
          })
          .on("mouseover", function(d, i) {
            if (d3.select(this).attr('selected') == 'false') {
              d3.select(this)
              .style('stroke-width', '0.5px');
            }
          })
          .on("mouseout", function(d, i) {
            if (d3.select(this).attr('selected') == 'false') {
              d3.select(this)
              .style('stroke-width', '0px');
            }
          });
     }
   });
}
