export function createXPGraph(transactions) {
  if (!transactions || transactions.length === 0) {
    console.error('No transaction data available');
    return;
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Calculate cumulative XP
  let cumulativeXP = 0;
  const xpData = sortedTransactions.map(t => {
    cumulativeXP += t.amount;
    return {
      x: new Date(t.createdAt).getTime(),
      y: cumulativeXP
    };
  });

  const options = {
    series: [{
      name: 'Cumulative XP',
      data: xpData
    }],
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: false
      },
      background: '#1f293a',
      foreColor: '#fff',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    theme: {
      mode: 'dark'
    },
    colors: ['#0ef'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#fff'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#fff'
        },
        formatter: function(value) {
          return Math.round(value);
        }
      }
    },
    grid: {
      borderColor: '#2c4766',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      y: {
        formatter: function(value) {
          return Math.round(value) + ' XP';
        }
      },
      marker: {
        show: true
      }
    },
    markers: {
      size: 4,
      colors: ['#0ef'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6
      }
    }
  };

  const chart = new ApexCharts(document.querySelector("#xpGraph"), options);
  chart.render();
}

export function createResultsGraph(results) {
  if (!results || results.length === 0) {
    console.error('No results data available');
    return;
  }

  // Count results
  const counts = results.reduce((acc, result) => {
    const status = result.result.name;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const options = {
    series: Object.values(counts),
    chart: {
      type: 'donut',
      height: 300,
      background: '#1f293a',
      foreColor: '#fff'
    },
    theme: {
      mode: 'dark'
    },
    labels: Object.keys(counts),
    colors: ['#0ef', '#2c4766', '#4CAF50', '#FFC107'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Poppins',
              color: '#fff'
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Poppins',
              color: '#0ef',
              formatter: function (val) {
                return val;
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontFamily: 'Poppins',
              color: '#fff',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Poppins',
      labels: {
        colors: '#fff'
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const chart = new ApexCharts(document.querySelector("#resultsGraph"), options);
  chart.render();
}
