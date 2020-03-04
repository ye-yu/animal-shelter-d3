function animalAdoption(directoryPrefix="") {
  d3.csv(directoryPrefix + 'adoption_month.csv').then(data => {

    /* util functions */
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }


    function describeSector(x, y, radius, startAngle, endAngle){
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      const d = [
        "M", x, y,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
      ].join(" ");

      return d;
    }


    function describeArchedSector(x, y, innerRadius, outerRadius, startAngle, endAngle) {
      const innerSector = {
        start: polarToCartesian(x, y, innerRadius, endAngle),
        end: polarToCartesian(x, y, innerRadius, startAngle)
      }

      const outerSector = {
        start: polarToCartesian(x, y, outerRadius, endAngle),
        end: polarToCartesian(x, y, outerRadius, startAngle)
      }

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      return [
        "M", innerSector.start.x, innerSector.start.y,
        "L", outerSector.start.x, outerSector.start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerSector.end.x, outerSector.end.y,
        "L", innerSector.end.x, innerSector.end.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerSector.start.x, innerSector.start.y,
        "Z"
      ].join(" ");
    }

    data = data.map(row => {
      let year = +row['year'];
      let month = +row['month'];
      let isAdopted = row['isAdopted'] == "True";
      let species = row['species'];
      return {
        year: year,
        month: month,
        isAdopted: isAdopted,
        species: species
      };
    });

    /* data transformation */
    let totalAnimals = data.reduce((acc, d) => {
      let found = acc.find(a => a.year === d.year && a.month === d.month);
      if (!found) {
        acc.push({year:d.year, month: d.month, data: [d.isAdopted]});
      }
      else {
        found.data.push(d.isAdopted);
      }
      return acc;
    }, []);

    totalAnimals = totalAnimals.map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });

    // set circle properties
    let sectorAngle = 360 / totalAnimals.length;
    let smallCircleMargin = 40;
    let radius =  $(window).width() * 0.3 / 2 - smallCircleMargin;
    let smallRadius =  $(window).width() * 0.7 / 3 / 2 - 2 * smallCircleMargin;
    // set scaling function
    let scaleSmallRadius = d3.scaleLinear()
    .domain([0, 1])
    .range([0, smallRadius]);
    let scaleRadius = d3.scaleLinear()
    .domain([0, 1])
    .range([0, radius]);

    let svgWidth=$(window).width(), svgHeight=$(window).width() * 0.4;
    let svg_all = d3.select("#adoption_allani")
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr('transform', `translate(${2 * smallCircleMargin}, 0)`);
    ////////////////////////////////////////////////////////////////////////////
    //All animal
    // insert data for inner sector
    svg_all.selectAll('path.adoption-allani-inner-circle')
    .data(totalAnimals)
    .enter()
    .append('path')
    .attr('class', 'adoption-allani-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = radius  + smallCircleMargin;
      let cy = radius + smallCircleMargin -1;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-allani-outer-circle')
    .data(totalAnimals)
    .enter()
    .append('path')
    .attr('class', 'adoption-allani-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleRadius(row.notAdopted);
      let outerRadius = radius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = radius + smallCircleMargin;
      let cy = radius + smallCircleMargin-1;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-allani-text')
    .data(totalAnimals)
    .enter()
    .append('text')
    .attr('class', 'adoption-allani-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = radius + smallCircleMargin;
      let cy = radius + smallCircleMargin-1;
      let position = polarToCartesian(cx, cy, radius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + smallCircleMargin;
      let cy = radius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, radius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text(row => `M${row.month}`);

    ////////////////////////////////////////////////////////////////////////////
    ///Get species
    let species = data.reduce((acc, d) => {
      let found = acc.find(a => a.year === d.year && a.species === d.species && a.month === d.month);
      if (!found) {
        acc.push({year:d.year, month: d.month, species: d.species, data: [d.isAdopted]});
      }
      else {
        found.data.push(d.isAdopted);
      }
      return acc;
    }, []);

    ////////////////////////////////////////////////////////////////////////////
    ////Cat
    let cats = species.filter(x => x.species == 'Cat').map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });
    sectorAngle = 360 / cats.length;

    // insert data for inner sector
    svg_all.selectAll('path.adoption-cat-inner-circle')
    .data(cats)
    .enter()
    .append('path')
    .attr('class', 'adoption-cat-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + smallRadius + 3 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-cat-outer-circle')
    .data(cats)
    .enter()
    .append('path')
    .attr('class', 'adoption-cat-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let outerRadius = smallRadius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + smallRadius + 3 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-cat-text')
    .data(cats)
    .enter()
    .append('text')
    .attr('class', 'adoption-cat-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + smallRadius + 3 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + smallRadius + smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text(row => `M${row.month}`);

    ////////////////////////////////////////////////////////////////////////////
    ////Dog
    let Dog = species.filter(x => x.species == 'Dog').map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });
    sectorAngle = 360 / Dog.length;

    // insert data for inner sector
    svg_all.selectAll('path.adoption-Dog-inner-circle')
    .data(Dog)
    .enter()
    .append('path')
    .attr('class', 'adoption-Dog-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + 5 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-Dog-outer-circle')
    .data(Dog)
    .enter()
    .append('path')
    .attr('class', 'adoption-Dog-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let outerRadius = smallRadius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + 5 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-Dog-text')
    .data(Dog)
    .enter()
    .append('text')
    .attr('class', 'adoption-Dog-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + 5 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text((row, i) => `M${row.month}`);

    ////////////////////////////////////////////////////////////////////////////
    ////House Rabbit
    let House_Rabbit = species.filter(x => x.species == 'House Rabbit').map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });
    sectorAngle = 360 / House_Rabbit.length;

    // insert data for inner sector
    svg_all.selectAll('path.adoption-House-Rabbit-inner-circle')
    .data(House_Rabbit)
    .enter()
    .append('path')
    .attr('class', 'adoption-House-Rabbit-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + 7 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-House-Rabbit-outer-circle')
    .data(House_Rabbit)
    .enter()
    .append('path')
    .attr('class', 'adoption-House-Rabbit-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let outerRadius = smallRadius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + 7 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-House-Rabbit-text')
    .data(House_Rabbit)
    .enter()
    .append('text')
    .attr('class', 'adoption-House-Rabbit-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + 7 * smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + smallCircleMargin;
      let cy = smallRadius + smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text((row, i) => `M${row.month}`);

    ////////////////////////////////////////////////////////////////////////////
    ////Guinea Pig
    let Guinea_Pig = species.filter(x => x.species == 'Guinea Pig').map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });
    sectorAngle = 360 / Guinea_Pig.length;

    // insert data for inner sector
    svg_all.selectAll('path.adoption-Guinea_Pig-inner-circle')
    .data(Guinea_Pig)
    .enter()
    .append('path')
    .attr('class', 'adoption-Guinea_Pig-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + smallRadius + 3 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-Guinea_Pig-outer-circle')
    .data(Guinea_Pig)
    .enter()
    .append('path')
    .attr('class', 'adoption-Guinea_Pig-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let outerRadius = smallRadius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + smallRadius + 3 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-Guinea_Pig-text')
    .data(Guinea_Pig)
    .enter()
    .append('text')
    .attr('class', 'adoption-Guinea_Pig-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + smallRadius + 3 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + smallRadius + smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text(row => `M${row.month}`);

    ////////////////////////////////////////////////////////////////////////////
    ////Rat
    let Rat = species.filter(x => x.species == 'Rat').map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });
    sectorAngle = 360 / Rat.length;

    // insert data for inner sector
    svg_all.selectAll('path.adoption-Rat-inner-circle')
    .data(Rat)
    .enter()
    .append('path')
    .attr('class', 'adoption-Rat-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + 5 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-Rat-outer-circle')
    .data(Rat)
    .enter()
    .append('path')
    .attr('class', 'adoption-Rat-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let outerRadius = smallRadius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + 5 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-Rat-text')
    .data(Rat)
    .enter()
    .append('text')
    .attr('class', 'adoption-Rat-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + 5 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 3*smallRadius + smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text((row, i) => `M${row.month}`);

    ////////////////////////////////////////////////////////////////////////////
    ////Others
    let Others = species.filter(x => x.species == 'Others').map(row => {
      let sum = row.data.length;
      let adopted = row.data.filter(x => x).length / sum;
      let notAdopted = 1 - adopted;
      return {
        year: row.year,
        month: row.month,
        adopted: adopted,
        notAdopted: notAdopted
      }
    });
    sectorAngle = 360 / Others.length;

    // insert data for inner sector
    svg_all.selectAll('path.adoption-Others-inner-circle')
    .data(Others)
    .enter()
    .append('path')
    .attr('class', 'adoption-Others-inner-circle')
    .attr('fill', (row, index) => {
      if (index % 2 == 0) {
        return '#253';
      }
      return '#352';
    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + 7 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      return describeSector(cx, cy, sectorRadius, startAngle, endAngle);
    });


    // insert data for outer sector
    svg_all.selectAll('path.adoption-Others-outer-circle')
    .data(Others)
    .enter()
    .append('path')
    .attr('class', 'adoption-Others-outer-circle')
    .attr('fill', row => {
      if (row.year == 2017) {
        return '#cc7';
      }
      if (row.year == 2018) {
        return '#cd8';
      }
      return '#cb6';

    })
    .attr('d', (row, index) => {
      let offset = 0.5;
      let sectorRadius = scaleSmallRadius(row.notAdopted);
      let outerRadius = smallRadius;
      let startAngle = index * sectorAngle + offset;
      let endAngle = (index + 1) * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + 7 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      return describeArchedSector(cx, cy, sectorRadius, outerRadius, startAngle, endAngle);
    });

    svg_all.selectAll('text.adoption-Others-text')
    .data(Others)
    .enter()
    .append('text')
    .attr('class', 'adoption-Others-text small')
    .attr('x', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + 7 * smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.x;
    })
    .attr('y', (row, index) => {
      let angle = index * sectorAngle + 0.5 * sectorAngle;
      let cx = 2 * radius + 5*smallRadius + smallCircleMargin;
      let cy = 3 * smallRadius + 3 * smallCircleMargin;
      let position = polarToCartesian(cx, cy, smallRadius + 10, angle);
      return position.y;
    })
    .attr('text-anchor', 'middle')
    .style('font-size', '0.55em')
    .text((row, i) => `M${row.month}`);

    /*
    if (row.year == 2017) {
    return '#cc7';
  }
  if (row.year == 2018) {
  return '#cd8';
}
return '#cb6';*/
let circleLegend = [
  {year: 2017, color: '#cc7'},
  {year: 2018, color: '#cd8'},
  {year: 2019, color: '#cb6'},
];
svg_all.selectAll('text.circle-legend')
.data(circleLegend)
.enter()
.append('text')
.attr('class', 'vis-body small circle-legend')
.attr("x", (row, index) => (index) * 2.5 * smallCircleMargin + 1.8 * smallCircleMargin)
.attr("y", 2 * radius + 3.5 * smallCircleMargin)
.text(d => d.year);

svg_all.selectAll('circle.circle-legend')
.data(circleLegend)
.enter()
.append('circle')
.attr("cx", (row, index) => (index) * 2.5 * smallCircleMargin + 1.5 * smallCircleMargin)
.attr("cy", 2 * radius + 3.4 * smallCircleMargin)
.attr("r", 7)
.attr("fill", d => d.color);

svg_all.append('text')
.attr('class', 'vis-body h6 font-weight-bold circle-legend')
.attr('text-anchor', 'middle')
.attr("x", 2.5 * smallCircleMargin + 2 * smallCircleMargin)
.attr("y", 2 * radius + 2.8 * smallCircleMargin)
.text("Year & Adopted Colour Legend");

svg_all.append('text')
.attr('class', 'vis-body h6 font-weight-bold circle-legend')
.attr('text-anchor', 'middle')
.attr("x", 2.5 * smallCircleMargin + 2 * smallCircleMargin)
.attr("y", 2 * radius + 4.4 * smallCircleMargin)
.text("Not Adopted Colour Legend");

svg_all.append('text')
.attr('class', 'vis-body small circle-legend')
.attr('text-anchor', 'middle')
.attr("x", 2.5 * smallCircleMargin + 2 * smallCircleMargin)
.attr("y", 2 * radius + 5 * smallCircleMargin)
.text("or");
svg_all.append('circle')
.attr("cx", 2.5 * smallCircleMargin + 2 * smallCircleMargin)
.attr("cy", 2 * radius + 5 * smallCircleMargin)
.text("or");
svg_all.append('circle')
.attr("cx", 0.9 * 2.5 * smallCircleMargin + 1.5 * smallCircleMargin)
.attr("cy", 2 * radius + 4.9 * smallCircleMargin)
.attr("r", 7)
.attr("fill", "#253");
svg_all.append('circle')
.attr("cx", 1.5 * 2.5 * smallCircleMargin + 1.5 * smallCircleMargin)
.attr("cy", 2 * radius + 4.9 * smallCircleMargin)
.attr("r", 7)
.attr("fill", "#352");


svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", radius + smallCircleMargin)
.attr("y", 2 * radius + 2 * smallCircleMargin)
.style("color", "black")
.text("All Animal");
svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", 3 * smallCircleMargin + 2 * radius + smallRadius)
.attr("y", 2 * smallCircleMargin + 2 * smallRadius)
.style("color", "black")
.text("Cat");
svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", 2 * radius + 3*smallRadius + 5 * smallCircleMargin)
.attr("y", 2 * smallCircleMargin + 2 * smallRadius)
.style("color", "black")
.text("Dog");
svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", 2 * radius + 5*smallRadius + 7 * smallCircleMargin)
.attr("y", 2 * smallCircleMargin + 2 * smallRadius)
.style("color", "black")
.text("House Rabbit");
svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", 3 * smallCircleMargin + 2 * radius + smallRadius)
.attr("y",  4 * smallRadius + 4 * smallCircleMargin)
.style("color", "black")
.text("Guinea Pig");
svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", 2 * radius + 3*smallRadius + 5 * smallCircleMargin)
.attr("y",  4 * smallRadius + 4 * smallCircleMargin)
.style("color", "black")
.text("Rat");
svg_all.append('text')
.attr('text-anchor', 'middle')
.attr('class', 'vis-body')
.attr("x", 2 * radius + 5*smallRadius + 7 * smallCircleMargin)
.attr("y", 4 * smallRadius + 4 * smallCircleMargin)
.style("color", "black")
.text("Others");
});
}
