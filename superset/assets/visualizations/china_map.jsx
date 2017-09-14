import d3 from 'd3';
import echarts from 'echarts';

import './china_map.css';
require('echarts/map/js/china');

function china_map_viz(slice, payload) {
  const div = d3.select(slice.selector);
  const data = payload.data;
  const fd = slice.formData;

  const width = slice.width();
  const height = slice.height();

  const geoCoordMap = data.geoCoordMap;
  const citiesWithValues = data.citiesWithValues;
  const valuesArray = citiesWithValues.map(item => item.value);
  const maxValue = Math.max.apply(null, valuesArray);
  const minValue = Math.min.apply(null, valuesArray);

  // TODO: clousre or curring
  // TODO: chart options panel
  var scaler = function(value, min=minValue, max=maxValue, 
    symbolMaxSize = 36, levelsAmount = 6) {

    let levels = []
    for (let i = 1; i <= levelsAmount; ++i) {
        levels.push(symbolMaxSize * i / levelsAmount);
    }
    levels.push(symbolMaxSize);

      // return symbolMaxSize * (value - minValue) / (maxValue - minValue);
      let index = Math.floor(levelsAmount * (value - minValue) / (maxValue - minValue));
      return levels[index];
  }

  var convertGeoData = function(geoData) {
    var res = [];
    for (var i = 0; i < geoData.length; ++i) {
      var geoCoord = geoCoordMap[geoData[i].name];
      if (geoCoord) {
        res.push({
          name: geoData[i].name,
          value: geoCoord.concat(geoData[i].value),
        });
      }
    }
    return res;
  };

  const ECHARTS_DOM_ID = 'echarts_dom';
  // everytime draw a new one
  const echarts_dom = d3.select('#' + ECHARTS_DOM_ID);
  if (!echarts_dom.empty()) {
      echarts_dom.remove();
  }
  div.append('div')
    .attr('id', ECHARTS_DOM_ID)
    .attr('width', width)
    .attr('height', height);

  // TODO
  // var chart = echarts.init(d3.select('#' + ECHARTS_DOM_ID), null,
  //   {'width': width, 'height': height});
  var chart = echarts.init(document.getElementById(ECHARTS_DOM_ID), null,
    {'width': width, 'height': height});

  var option = {
    backgroundColor: '#404a59',
    title: {
      text: '', // TODO
      subtext: '',
      sublink: '',
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip : {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      y: 'bottom',
      x:'right',
      data:[''], // TODO
      textStyle: {
        color: '#fff'
      },
    },
    visualMap: { // TODO
      min: minValue,
      max: maxValue,
      left: 'left',
      top: 'bottom',
      text: ['max','min'],
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d'],
        // symbolSize: [10, 30],
      },
    },
    geo: {
      map: 'china',
      label: {
        emphasis: {
          show: false
        }
      },
      roam: true,
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#111'
        },
        emphasis: {
          areaColor: '#2a333d'
        }
      }
    },
    series : [
      {
        name: '', // TODO
        type: 'scatter',
        coordinateSystem: 'geo',
        data: convertGeoData(citiesWithValues),
        symbolSize: (val) => scaler(val[2]),
        label: {
          normal: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#ddb926'
          }
        }
      },
    {
      name: 'Top 5', // TODO
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: convertGeoData(citiesWithValues.sort(function (a, b) {
        return b.value - a.value;
      }).slice(0, 6)),
      symbolSize: (val) => scaler(val[2]),
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      hoverAnimation: true,
      label: {
        normal: {
          formatter: '{b}',
          position: 'right',
          show: true, 
        }
      },
      tooltip: {
        trigger: 'item',
        // TODO: fuck this template
        // formatter: '{a},{b},{c2},{d}',
      },
      itemStyle: {
        normal: {
          color: '#f4e925',
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      zlevel: 1
    },
    ],
  };

  chart.setOption(option);
}

module.exports = china_map_viz;
