function animalDeceasedReason() {

  function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
  }

  var frames = []
  var x = ["March 17", "April 17", "May 17", "June 17", "July 17", "August 17", "September 17", "October 17", "November 17", "December 17", "January 18", "February 18", "March 18", "April 18", "May 18", "June 18",
  "July 18", "August 18", "September 18", "October 18", "November 18", "December 18","January 19", "February 19", "March 19", "April 19", "May 19", "June 19",
  "July 19", "August 19"]
  var y = [8, 192, 95, 48, 23, 11, 12, 9, 1, 1, 2, 4, 3, 3, 7, 1, 6, 7, 4, 6, 2, 0, 1, 1, 0, 4, 12, 9, 3, 1]
  var y2 = [0, 5, 104, 200, 284, 271, 246, 261, 189, 233, 180, 129, 180, 176, 208, 231, 267, 280, 276, 274, 201, 279, 213, 180, 190, 182, 229, 299, 280, 300]
  var y3 = [0, 10, 24, 22, 16, 11, 28, 33, 39, 41, 55, 50, 43, 35, 35, 47, 50, 62, 68, 76, 72, 71, 83, 79, 75, 73, 86, 89, 85, 83]
  var y4 = [0, 10, 15, 17, 15, 20, 30, 25, 10, 10, 10, 15, 5, 15, 20, 27, 31, 20, 20, 15, 10, 26, 28, 20, 18, 9, 12, 15, 11, 10]

  var n = 30;
  for (var i = 0; i < n; i++) {
    frames[i] = {data: [{x: [], y: []}, {x: [], y: []}, {x: [], y: []}, {x: [], y: []}]}
    frames[i].data[1].x = x.slice(0, i+1);
    frames[i].data[1].y = y.slice(0, i+1);
    frames[i].data[0].x = x.slice(0, i+1);
    frames[i].data[0].y = y2.slice(0, i+1);
    frames[i].data[2].x = x.slice(0, i+1);
    frames[i].data[2].y = y3.slice(0, i+1);
    frames[i].data[3].x = x.slice(0, i+1);
    frames[i].data[3].y = y4.slice(0, i+1);
  }

  var trace2 = {
    type: "scatter",
    mode: "lines",
    name: 'Court Order',
    x: frames[29].data[0].x,
    y: frames[29].data[0].y,
    line: {color: '#ff0000'}
  }


  var trace3 = {
    type: "scatter",
    mode: "lines",
    name: 'Died in Care',
    x: frames[29].data[1].x,
    y: frames[29].data[1].y,
    line: {color: '#000000'}
  }

  var trace4 = {
    type: "scatter",
    mode: "lines",
    name: 'Behavioural Problems',
    x: frames[29].data[2].x,
    y: frames[29].data[2].y,
    line: {color: '#00ffaa'}
  }

  var trace5 = {
    type: "scatter",
    mode: "lines",
    name: 'Request to Put Down',
    x: frames[29].data[3].x,
    y: frames[29].data[3].y,
    line: {color: '#e600e6'}
  }


  var data = [trace2, trace3, trace4, trace5];

  var layout = {
    title: {
      text:'Line Chart of Animal Death Cause (2017-2019)',
      font: {
        family: 'Merriweather',
        size: 24
      },
    },
    y:1.0,
    x:0.5,
    annotations: [{
      text: "Click 'Play' to view animation",
      font: {
        family : "Merriweather",
        size: 12,
        color: 'rgb(116, 101, 130)',
      },
      showarrow: false,
      align: 'center',
      x: 0.5,
      y: 1.13,
      xref: 'paper',
      yref: 'paper',
    }],
    xaxis: {
      range: [frames[29].data[0].x[0], frames[29].data[0].x[29]],

      title: {
        text: 'Month(year)',
        font: {
          family: 'Nanum Gothic, monospace',
          size: 18,
          color: '#7f7f7f'
        },
      },
      tickmode: "array",
      tickangle: 35,
      tickvals: ["March 17",  "June 17",  "September 17",  "December 17",  "March 18",  "June 18",
      "September 18",  "December 18", "March 19",  "June 19"
    ],
    ticktext: ["March 17",  "June 17",  "September 17",  "December 17",  "March 18",  "June 18",
    "September 18",  "December 18", "March 19",  "June 19"
  ],
  tickfont : 'Nanum Gothic, monospace',
  ticksize : 25,
  zerolinecolor:'#000000'
},
yaxis: {
  range: [0, 300],


  title: {
    text: 'Num. of Animals',
    font: {
      family: 'Nanum Gothic, monospace',
      size: 18,
      color: '#7f7f7f'
    },
  },
  tickfont : 'Nanum Gothic, monospace',
  ticksize : 25,
},
legend: {
  orientation: 'h',
  x: 0.5,
  y: 1.08  ,
  xanchor: 'center',
  font : "Nanum Gothic"
},
updatemenus: [{
  x: 0.5,
  y: 0,
  yanchor: "top",
  xanchor: "center",
  showactive: false,
  direction: "left",
  type: "buttons",
  pad: {"t": 87, "r": 10},
  buttons: [{
    method: "animate",
    args: [null, {
      fromcurrent: true,
      transition: {
        duration: 0,
      },
      frame: {
        duration: 250,
        redraw: false
      }
    }],
    label: "Play"
  }, {
    method: "animate",
    args: [
      [null],
      {
        mode: "immediate",
        transition: {
          duration: 0
        },
        frame: {
          duration: 0,
          redraw: false
        }
      }
    ],
    label: "Pause"
  }]
}]
};

Plotly.newPlot('bubble_chart', data, layout).then(function() {
  Plotly.addFrames('bubble_chart', frames);
});
}
