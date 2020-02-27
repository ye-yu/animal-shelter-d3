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
    selectedMovements: {}
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

    /* label movement title */
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
    .text(d => `${d[0]} Movement`);

    d3.json('movement-count.json').then(movementCount => {
      function consecutiveMovement(a, b) {
        a = a.split(/:/)[0];
        b = b.split(/:/)[0];

        return (
          (a == '1st' && b == '2nd') ||
          (a == '2nd' && b == '3rd') ||
          (a == '3rd' && b == '4th') ||
          (a == '4th' && b == '>4th')
        )
      }

      function unstack(a) {
        let unstacked = [];
        for(let e of a) {
          for(let d of e[1]) {
            unstacked.push([e[0], d[0], d[1]['Total']]);
          };
        }
        return unstacked;
      }

      let consecutiveCount = tuplize(movementCount).map(x => [x[0], tuplize(x[1]).filter(y => consecutiveMovement(x[0], y[0]))]);
      consecutiveCount = unstack(consecutiveCount);
      /* draw line between boxes */
      let lineCountMin = d3.min(consecutiveCount.map(x => x[2]));
      let lineCountMax = d3.max(consecutiveCount.map(x => x[2]));
      let lineScale = d3.scaleLog()
      .domain([lineCountMin,lineCountMax])
      .range([3, 15]);

      function splitToMovement(string) {
        string = string.split(/:/);
        let movementNumber = string[0];
        let movementType = string[1];

        movementType = tuplize(data[movementNumber])
        .filter(x => x[0] !== 'Total')
        .sort((a, b) => b[1]['Total'] - a[1]['Total'])
        .map(x => x[0])
        .indexOf(movementType);
        movementNumber = Object.keys(data).indexOf(movementNumber);

        return {
          type: movementType,
          number: movementNumber
        }
      }

      consecutiveCount = consecutiveCount.map(x => ({
        id: CSS.escape(`line-${x[0]}:${x[1]}`.replace(/(\s|:|>|\*)/g, '-')),
        from: splitToMovement(x[0]),
        to: splitToMovement(x[1]),
        count: x[2]
      }));
      console.log(consecutiveCount);

      svg.append('g')
      .attr('id', 'line-group')
      .selectAll('line')
      .data(consecutiveCount)
      .enter()
      .append('line')
      .attr('id', d => d.id)
      .attr('x1', d => `${graphDimension.marginX + (d.from.number + 1) * movementContainer.width + d.from.number * linksContainer.width}px`)
      .attr('x2', d => `${graphDimension.marginX + d.to.number * (movementContainer.width) + d.to.number * linksContainer.width}px`)
      .attr('y1', d => `${graphDimension.marginY + graphDimension.offsetTop + d.from.type * movementContainer.height + 0.5 * movementContainer.height}px`)
      .attr('y2', d => `${graphDimension.marginY + graphDimension.offsetTop + d.to.type * movementContainer.height + 0.5 * movementContainer.height}px`)
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('stroke-opacity', '0.35')
      .attr('stroke-linecap', 'round');

      /* draw individual movement boxes */
      for(let {index, value} of enumerate(data)) {
        let nMovement = tuplize(data[value]).filter(x => x[0] !== 'Total').sort((a, b) => b[1]['Total'] - a[1]['Total']);
        let total = data[value]['Total'];

        let g = d3.select(`g#movement-${index}-container`);

        /* append each movement box */
        g.selectAll(`rect`)
        .data(nMovement)
        .enter()
        .append('rect')
        .attr('y', (d, i) => `${graphDimension.marginY + graphDimension.offsetTop + i*movementContainer.height	}px`)
        .attr('x', `${graphDimension.marginX + index * (movementContainer.width + linksContainer.width)}px`)
        .attr('width', `${movementContainer.width}px`)
        .attr('height', `${movementContainer.height - 3}px`)
        .attr('fill', d => `${heatmapColour(d[1]['Total'])}`)
        .attr('stroke', 'gray')
        .attr('stroke-width', '0px');

        // console.log("box", value, "array", nMovement);
        /* append each movement box label */
        g.selectAll(`text.movement-${index}-rect`)
        .data(nMovement)
        .enter()
        .append('text')
        .attr('class', `vis-body movement-${index}-rect`)
        .attr('text-anchor', 'middle')
        .attr('y', (d, i) => `${graphDimension.marginY + graphDimension.offsetTop + movementContainer.height/2 + 3 + i*movementContainer.height}px`)
        .attr('x', `${graphDimension.marginX + 0.5 * movementContainer.width + index * (movementContainer.width + linksContainer.width)}px`)
        .text(d => `${d[0]}`)
        .style('font-size', '0.75em');

        /* create selection box */
        g.selectAll(`rect.movement-${index}-rect`)
        .data(nMovement)
        .enter()
        .append('rect')
        .attr('id', d => `${value}:${d[0]}`)
        .attr('class', `movement-${index}-rect`)
        .attr('y', (d, i) => `${graphDimension.marginY + graphDimension.offsetTop + i*movementContainer.height	}px`)
        .attr('x', `${graphDimension.marginX + index * (movementContainer.width + linksContainer.width)}px`)
        .attr('width', `${movementContainer.width}px`)
        .attr('height', `${movementContainer.height - 3}px`)
        .attr('fill-opacity', '0')
        .attr('stroke', 'gray')
        .attr('stroke-width', '0px')
        .attr('selected', false)
        .style("pointer-events", "all")
        .on("click", function(d, i) {
          let element = d3.select(this);
          if (element.attr('selected') == 'true') {
            element.attr('selected', false)
            .transition()
            .style('stroke-width', '0px');
            unhighlightSelectedMovement(element.attr('id'));
          } else {
            wdtgEvents.selectedMovements[element.attr('id')] = this;
            element.attr('selected', true)
            .transition()
            .style('stroke-width', '2px');
            highlightSelectedMovement();
          }

          if (Object.keys(wdtgEvents.selectedMovements).length > 0) {
            d3.select('g#wdtg-clear-button')
            .transition()
            .attr('opacity', '1');
          } else {
            d3.select('g#wdtg-clear-button')
            .transition()
            .attr('opacity', '0');
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

      function highlightSelectedMovement() {
        if (Object.keys(wdtgEvents.selectedMovements).length > 1) {
          let movements = Object.keys(data);
          let selected = tuplize(wdtgEvents.selectedMovements)
          .map(x => x[0])
          .sort((a, b) => movements.indexOf(a.split(/:/)[0]) - movements.indexOf(b.split(/:/)[0]));

          let pairs = []
          for (let i = 0; i < selected.length - 1; i++) {
            for (let j = i + 1; j < selected.length; j++) {
              if (consecutiveMovement(selected[i], selected[j])) {
                pairs.push([`${selected[i]}:${selected[j]}`]);
                let lineId = `line#line-${selected[i]}:${selected[j]}`.replace(/(\s|:|>|\*)/g, '-');
                d3.select(lineId)
                .transition()
                .attr('stroke-width', d => `${lineScale(d.count)}`);
              }
            }
          }
          console.log(pairs);
        }
      }

      function unhighlightSelectedMovement(unhighlighted) {
        if (Object.keys(wdtgEvents.selectedMovements).length > 1) {
          let movements = Object.keys(data);
          let selected = tuplize(wdtgEvents.selectedMovements)
          .map(x => x[0])
          .sort((a, b) => movements.indexOf(a.split(/:/)[0]) - movements.indexOf(b.split(/:/)[0]));

          let pairs = []
          for (let i = 0; i < selected.length - 1; i++) {
            for (let j = i + 1; j < selected.length; j++) {
              if (consecutiveMovement(selected[i], selected[j]) &&
                  isinarray([selected[i], selected[j]], unhighlighted)) {
                pairs.push([`${selected[i]}:${selected[j]}`]);
                let lineId = `line#line-${selected[i]}:${selected[j]}`.replace(/(\s|:|>|\*)/g, '-');
                d3.select(lineId)
                .transition()
                .attr('stroke-width', d => '1px');
              }
            }
          }
          console.log("Unselected", pairs);
        }
        delete wdtgEvents.selectedMovements[unhighlighted];
      }

      function unselectAllBoxes() {
        for(let selected in wdtgEvents.selectedMovements) {
          d3.select(wdtgEvents.selectedMovements[selected])
          .attr('selected', false)
          .transition()
          .style('stroke-width', '0px');
        }
        d3.select('line')
        .transition()
        .attr('stroke-width', d => '1px');
        delete wdtgEvents.selectedMovements;
        wdtgEvents.selectedMovements = {};
      }

      let clearButton = svg.append('g');
      clearButton.attr('id', 'wdtg-clear-button')
      .attr('opacity', '0');

      let clearButtonAttr = {};
      clearButtonAttr.width = 60;
      clearButtonAttr.height = 30;
      clearButton.append('rect')
      .attr('x', `${graphDimension.width/2}px`)
      .attr('y', `${graphDimension.offsetTop + graphDimension.height - clearButtonAttr.height/2}px`)
      .attr('width', `${clearButtonAttr.width}px`)
      .attr('height', `${clearButtonAttr.height}px`)
      .attr('fill', '#f7f7f7');

      clearButton.append('text')
      .attr('class', 'vis-body small font-weight-bold')
      .attr('textLength', 30)
      .attr('x', `${0.5 * clearButtonAttr.width + graphDimension.width/2}px`)
      .attr('y', `${0.6 * clearButtonAttr.height + graphDimension.offsetTop + graphDimension.height - clearButtonAttr.height/2}px`)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.75em')
      .text('clear');

      clearButton.append('rect')
      .attr('x', `${graphDimension.width/2}px`)
      .attr('y', `${graphDimension.offsetTop + graphDimension.height - clearButtonAttr.height/2}px`)
      .attr('width', `${clearButtonAttr.width}px`)
      .attr('height', `${clearButtonAttr.height}px`)
      .attr('fill-opacity', '0')
      .attr('stroke', 'gray')
      .attr('stroke-width', '0.5px')
      .style("pointer-events", "all")
      .on("click", function(d, i) {
        d3.select(this)
        .style('stroke-width', '0.5px');
        unselectAllBoxes();
        d3.select('g#wdtg-clear-button')
        .transition()
        .attr('opacity', '0');
      })
      .on("mouseover", function(d, i) {
        d3.select(this)
        .style('stroke-width', '1px');
      })
      .on("mouseout", function(d, i) {
        d3.select(this)
        .style('stroke-width', '0.5px');
      });
    })
    .then(() => {
      /* hot fix to put line to the back */
      let e = $('#line-group');
      e.parent().prepend(e);
    });
  });
}
