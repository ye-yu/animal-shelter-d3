function animalLifespan(directoryPrefix="") {
  d3.json(directoryPrefix + "boxplot_data.json").then(data => {
    var y0 = data[0]['values'];
    var y1 = data[1]['values'];
    var y2 = data[2]['values'];
    var y3 = data[3]['values'];
    var y4 = data[4]['values'];
    var y5 = data[5]['values'];

    var trace1 = {
      y: y0,
      type: 'box',
      name: 'Carnivora'
    };

    var trace2 = {
      y: y1,
      type: 'box',
      name: 'Lagomorpha'
    };

    var trace3 = {
      y: y2,
      type: 'box',
      name: 'Rodentia'
    };

    var trace4 = {
      y: y3,
      type: 'box',
      name: 'Galiformes'
    };

    var trace5 = {
      y: y4,
      type: 'box',
      name: 'Squamata'
    };

    var trace6 = {
      y: y4,
      type: 'box',
      name: 'Artiodactyla'
    };

    var data = [trace1, trace2, trace3, trace4, trace5, trace6];
    var config = {responsive: true}
    var layout = {
      showlegend : false,
      title: {
        text:'Boxplot of Animal Age Distribution',
        font: {
          family: 'Merriweather',
          size: 24
        },
        xref: 'paper',
        y:0.9,
        x:0.5,
      },
      xaxis: {
        title: {
          text: 'Animal Order',
          font: {
            family: 'Nanum Gothic, monospace',
            size: 16,
            color: '#7f7f7f'
          },
          tickfont : 'Nanum Gothic, monospace',
          ticksize : 25
        },
      },
      yaxis: {
        title: {
          text: 'Age Distribution (months)',
          font: {
            family: 'Nanum Gothic, monospace',
            size: 16,
            color: '#7f7f7f'
          },
          tickfont : 'Nanum Gothic, monospace',
          ticksize : 20
        }
      }
    };

    Plotly.newPlot('boxplot', data, layout,config);

    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }
  });
}
