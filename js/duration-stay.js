function durationStay(directoryPrefix="") {
  // set the dimensions of the graph
  var widthRatio = 0.7, heightRatio=0.8;
  var width = $(window).width() * widthRatio,
  height = $(window).height() * heightRatio;

  // append the svg object to the body of the page
  var svg = d3.select("div#hldts #my_dataviz")
  .append("svg")
  .attr("width", $(window).width())
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${$(window).width() * (1 - widthRatio)/2}, 0)`)
  ;

  // read json data
  d3.json(directoryPrefix + "duration_stay.json").then(function(data) {

    // Give the data to this cluster layout:
    function minMax(arr) {
      return [d3.min(arr), d3.max(arr)]
    }

    var root = d3.hierarchy(data)
    .sum(function(d){ return d.value})
    .sort((b, a) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

    /* calculate the domain for each parent tree */
    var domains = {};
    data['children']
    .map(x => [x['name'], x['children']])
    .forEach(row => domains[row[0]] = minMax(row[1].map(x => x.value)));
    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
    .size([width, height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3)      // Padding between each rectangle
    //.paddingOuter(6)
    //.padding(20)
    (root)

    // prepare a color scale
    var color = d3.scaleOrdinal()
    .domain(["Cat", "Dog", "Others"])
    .range([ "#425", "#A55", "#5A5"])

    // And a opacity scale
    var opacity = d3.scaleLinear()
    .range([1, 0.7])
    // use this information to add rectangles:
    svg
    .selectAll("div#hldts rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr('x', function (d) { return d.x0; })
    .attr('y', function (d) { return d.y0; })
    .attr('width', function (d) { return d.x1 - d.x0; })
    .attr('height', function (d) { return d.y1 - d.y0; })
    .style("stroke", "black")
    .style("fill", function(d){ return color(d.parent.data.name)} )
    .style("opacity", function(d){ return opacity.domain(domains[d.parent.data.name])(d.data.value)})

    function wrap(text, width) {
      text.each(function() {
        let text = d3.select(this),
        words = text.text().split('').reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 1.1,
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (words.length > 0) {
          word = words.pop()
          line.push(word);
          tspan.text(line.join(""));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(""));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
    // and to add the text labels
    svg
    .selectAll("div#hldts text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("class", "vis-body small")    // +10 to adjust position (more right)
    .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
    .attr("y", function(d){ return d.y0+0})    // +20 to adjust position (lower)
    .text(function(d){ return d.data.name })
    .attr("fill", "white")
    .each(function(d){ wrap(d3.select(this), d.x1 - d.x0 - 5)})


    // and to add the text labels
    svg
    .selectAll("div#hldts vals")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("class", "vis-body")
    .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
    .attr("y", function(d){ return d.y1-5})    // +20 to adjust position (lower)
    .text(function(d){ return `${d.data.value.toFixed(2)} days` })
    .attr("font-size", "0.55em")
    .attr("fill", "white")

    // Add title for the 3 groups
    svg
    .selectAll("div#hldts titles")
    .data(root.descendants().filter(function(d){return d.depth==1}))
    .enter()
    .append("text")
    .attr("class", "vis-body")
    .attr("x", function(d){ return d.x0})
    .attr("y", function(d){ return d.y0+21})
    .text(function(d){ return d.data.name })
    .attr("font-size", "0.9em")
    .attr("fill",  function(d){ return color(d.data.name)} )

    // Add title for the 3 groups
    svg
    .append("text")
    .attr("x", width/2)
    .attr("y", 20)    // +20 to adjust position (lower)
    .attr("class", "vis-title text-capitalize")
    .text("Duration of animal stay")
    .attr("font-size", "19px")
    .attr("text-anchor", "middle")
  })
}
