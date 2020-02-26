"use strict";

function whereDoTheyGo() {
  let containerWidth=$('#wdtg-container').width();
  let containerHeight=containerWidth*0.35;

  let svg = d3.select('svg#wdtg-graph');
  let legend = d3.select('svg#wdtg-legend');

  let xCoverage=0.8;
  let yCoverage=0.8;
  let graphDimension={
    width:containerWidth*xCoverage,
    height:containerHeight*yCoverage,
    marginX:0.5*(containerWidth-containerWidth*xCoverage),
    marginY:0.5*(containerHeight-containerHeight*yCoverage),
    offsetTop:40
  };

  /* set the size of the svg */
  svg.attr('width', `${containerWidth}px`)
     .attr('height', `${containerHeight}px`);

  let wdtgEvents = {
    selectedMovements: []
  };

  console.log(graphDimension);

  let heatmapColour = d3.interpolateCividis;

  /* set title of the graph */
  svg.append('text')
     .attr('class', 'vis-title h5')
     .attr('text-anchor', 'middle')
     .attr('x', `${containerWidth/2}px`)
     .attr('y', `${graphDimension.offsetTop + 10}px`)
     .text("Parallel Linked Heatmap of Animals' Movement");
}
