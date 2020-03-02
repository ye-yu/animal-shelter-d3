"use strict";

function whereDoTheyComeFrom(directoryPrefix='') {
  function updateGeneralDescription(text, focus=true) {
    $("#wdtcm-description").html(text);
    if (focus) {
      $('body').scrollTo('#wdtcm-full-container');
    }
  }

  function updateHoverDescription(text) {
    $("#wdtcm-extra-information").html(text);
  }

  $('#wdtcm-extra-information-container').hide();

  let containerWidth=$('#wdtcm-container').width();
  let containerHeight=containerWidth*0.55;

  let svg = d3.select('svg#wdtcm-graph');

  let xCoverage=0.8;
  let yCoverage=0.7;
  let graphDimension={
    width:containerWidth*xCoverage,
    height:containerHeight*yCoverage,
    marginX:0.5*(containerWidth-containerWidth*xCoverage),
    marginY:0.5*(containerHeight-containerHeight*yCoverage),
    offsetTop:40
  };

  let wdtcmEvents = {
    viewBy: 'count'
  };

  let yScale = d3.scaleLinear();
  let xScale = d3.scaleLinear();
  d3.json(directoryPrefix + "intakes.json")
  .then(data => {

    /* calculate y-axis scale */
    // get max over all quarters
    // convert to tuples
    let totalOverQuarter=[];
    for(let i in data) {
      totalOverQuarter.push(data[i]['Total']);
    }
    let maxOverQuarter=d3.max(totalOverQuarter);

    yScale = yScale.domain([1, maxOverQuarter])
    .range([graphDimension.offsetTop + graphDimension.height + graphDimension.marginY,
      graphDimension.offsetTop + graphDimension.marginY])
      .nice();

      /* calculate x-axis scale */
      xScale = xScale.domain([0,
        Object.keys(data).length - 1])
        .range([graphDimension.marginX,
          graphDimension.width + 1.5 * graphDimension.marginX])
          .nice();

          let distribution={};
          for(let quarter in data) {
            for (let reason in data[quarter]) {
              if (reason == 'Total') {
                continue;
              }
              if (!isinkey(distribution, reason)) {
                distribution[reason]={};
              }
              for (let animal in data[quarter][reason]['Animal']) {
                if (animal == 'Total') {
                  continue;
                }
                if (!isinkey(distribution[reason], animal)) {
                  distribution[reason][animal] = 0;
                }

                distribution[reason][animal] += data[quarter][reason]['Animal'][animal];
              }
            }
          }

          let reasonTotal = {};
          for(let reason in distribution) {
            distribution[reason] = tuplize(distribution[reason]).sort((a, b) => b[1] - a[1]);
            let sum = distribution[reason].map(x => x[1]).reduce((a, b) => a+b);

            reasonTotal[reason] = sum;
          }
          let types = tuplize(reasonTotal).sort((a, b) => a[1] - b[1]).map(e => e[0]);

          /* stack entries dataset */
          let rows=[];
          let todate = d3.timeParse("%YQ%q");
          for(let i in data) {
            let datum={};
            datum.Time = todate(i);
            for(let reason of types) {
              datum[reason] = 0;
            }

            let reasons = Object.keys(data[i]).filter(e => e !== 'Total');
            for(let reason of reasons) {
              datum[reason] = data[i][reason]['Total'];
            }
            rows.push(datum);
          }

          let stacker = d3.stack()
          .keys(types);
          let stacked = stacker(rows);

          /* prepare drawing utils */
          let colourScale = d3.scaleLinear()
          .domain([0, types.length-1])
          .range([0.25, 0.7]);
          let drawCountArea = d3.area()
          .x((d, i) => xScale(i))
          .y0(d => yScale(d[0]))
          .y1(d => yScale(d[1]));

          let drawPercentageArea = d3.area()
          .x((d, i) => xScale(i))
          .y0((d, i) => yScale(d[0]/totalOverQuarter[i] * 100))
          .y1((d, i) => yScale(d[1]/totalOverQuarter[i] * 100));

          /* draw stacked line char */
          svg.attr('width', containerWidth + 'px')
          .attr('height', (1.1 * (graphDimension.offsetTop + containerHeight)) + 'px')
          .selectAll('svg#wdtcm-graph path')
          .data(stacked)
          .enter()
          .append('path')
          .attr('class', 'wdtcm-plot')
          .attr('d', s => drawCountArea(s))
          .style('fill', (d, i) => d3.interpolateRdYlBu(colourScale(i)))
          .style("pointer-events", "all")
          .on("mouseover", function(d, i) {
            d3.select(this)
            .style('stroke-width', '2px')
            .style('stroke', 'gray');
            $('#wdtcm-legend-container').hide();
            $('#wdtcm-instruction').hide();
            $('#wdtcm-extra-information-container').show();
            updateHoverDescription(visualisationDescription[wdtcmEvents.viewBy][types[i]]);
          })
          .on("mouseout", function(d, i) {
            $('#wdtcm-extra-information-container').hide();
            $('#wdtcm-legend-container').show();
            $('#wdtcm-instruction').show();
            d3.select(this)
            .style('stroke-width', 'none')
            .style('stroke', 'none');
          });

          /* add legend information*/
          let legends = [];
          types.forEach((e, i) => {
            let colour = d3.interpolateRdYlBu(colourScale(i));
            let template = `          <li class="list-group-item py-1 small border-0">
            <svg height="10px" width="10px">
            <rect height="100%" width="100%" fill="${colour}">
            </svg>
            <div class="d-inline-block pl-1">
            ${e}
            </div>
            </li>`;
            legends.push(template);
          });
          legends.reverse().forEach(e => $('#wdtcm-legend-container').append(e));

          /* add axis */
          svg.append("g")
          .attr('id', 'wdtcm-yaxis')
          .attr('transform', `translate(${graphDimension.marginX}, 0)`)
          .call(d3.axisLeft(yScale));

          svg.append("g")
          .attr('id', 'wdtcm-xaxis')
          .attr('transform', `translate(0, ${graphDimension.offsetTop + graphDimension.marginY + graphDimension.height})`)
          .call(d3.axisBottom(xScale).tickFormat((d) => Object.keys(data)[d]));

          svg.append("text")
          .attr('class', 'vis-body small')
          .attr('id', 'wdtcm-xaxis-label')
          .attr('text-anchor', 'middle')
          .attr('x', `${graphDimension.marginX}px`)
          .attr('y', `${graphDimension.offsetTop + graphDimension.marginY - 20}px`)
          .text('Count');

          svg.append("text")
          .attr('class', 'vis-body small')
          .attr('text-anchor', 'middle')
          .attr('x', `${containerWidth/2}px`)
          .attr('y', `${graphDimension.offsetTop + graphDimension.height + graphDimension.marginY + 40}px`)
          .text('Quarter of the Year');

          /* add chart label */
          svg.append("text")
          .attr('class', 'vis-title h5')
          .attr('text-anchor', 'middle')
          .attr('x', `${containerWidth/2}px`)
          .attr('y', `${graphDimension.offsetTop + 10}px`)
          .text('Animal Intakes Over the Quarter of the Year');

          /* add visualisation description */
          let visualisationDescription = {count:{},percentage:{}};
          // description when view by count
          visualisationDescription['count']['default'] = `The sum of the animal intakes
          showed a mountain-shaped line graph over the years. This behaviour is
          seemingly seasonal &ndash; meaning the mountain-shape repeats on every year as shown in the graph. This
          indicates that the season of the year affects the number of intakes of the quarter;
          The animal intake activity increases on every period from the end of the spring
          until mid-summer.`;

          // description when view by percentage
          visualisationDescription['percentage']['default'] = `From the second quarter
          of 2017 onwards, almost 50% of the intakes are purely stray animals while
          20% consist of multiple reasons aggregated as one category. The intake reason
          of owner incompatibility and litter relinquishment behave almost reciprocately
          where the percentage of one increases as the other decreases. Intakes due to
          moving owner grow and drop occasionally while remaining as the 4th top intake reasons.
          `;

          // dynamically add description for each intake reason
          for(let reason in distribution) {
            let countTemplate = '';
            for(let count of distribution[reason]) {
              countTemplate += `
              <li class="list-group-item py-1">
              ${count[0]}
              <div style='float:right'>
              ${count[1]}
              </div>
              </li>`;
            }
            visualisationDescription['count'][reason] = `
            <div class='text-center py-3'> (${reason}) </div>
            Count distribution:
            <ul class="list-group small">
            ${countTemplate}
            </ul>
            `;

            let percentageTemplate = '';
            for(let count of distribution[reason]) {
              let percent = count[1]/reasonTotal[reason] * 100;
              percentageTemplate += `
              <li class="list-group-item py-1">
              ${count[0]}
              <div style='float:right'>
              ${percent.toFixed(2)} %
              </div>
              </li>`;
            }
            visualisationDescription['percentage'][reason] = `
            <div class='text-center py-3'> (${reason}) </div>
            Percentage distribution:
            <ul class="list-group small">
            ${percentageTemplate}
            </ul>
            `;

            if (reason == 'Other reason') {
              let otherReasonDescription = `
              <div class='small pt-3'>
              The top three of intake reason in this category include:
              Unsuitable Accomodation (15%),
              Abandoned (14%),
              and Unable to Afford (12%).
              </div>`;
              visualisationDescription['count'][reason] += otherReasonDescription;
              visualisationDescription['percentage'][reason] += otherReasonDescription;
            }
          }

          updateGeneralDescription(visualisationDescription['count']['default'], false);

          /* add action on button click */
          $('#wdtcm-count').click(e => {
            d3.select("svg#wdtcm-graph #wdtcm-xaxis-label")
            .text("Count");

            yScale=yScale.domain([1, maxOverQuarter])
            .nice();

            svg.select("svg#wdtcm-graph g#wdtcm-yaxis")
            .transition()
            .call(d3.axisLeft(yScale));

            d3.selectAll('svg#wdtcm-graph path.wdtcm-plot')
            .transition()
            .attr('d', s => drawCountArea(s));

            wdtcmEvents.viewBy = 'count';
            updateGeneralDescription(visualisationDescription['count']['default']);
          });

          $('#wdtcm-percentage').click(e => {
            d3.select("svg#wdtcm-graph #wdtcm-xaxis-label")
            .text("Percentage (%)");

            yScale=yScale.domain([0, 100])
            .nice();

            svg.select("svg#wdtcm-graph g#wdtcm-yaxis")
            .transition()
            .call(d3.axisLeft(yScale));

            d3.selectAll('svg#wdtcm-graph path.wdtcm-plot')
            .transition()
            .attr('d', s => drawPercentageArea(s));

            wdtcmEvents.viewBy = 'percentage';
            updateGeneralDescription(visualisationDescription['percentage']['default']);
          });
        });
      }
