var ibmUrl =
  'https://b482ecaa-1ac2-4933-bec9-ecade207eea0-bluemix.cloudant.com';
var BaseUrl = 'https://couch.dewachen.org';
var isAcme = document.location.hostname.startsWith('acme');
if (isAcme) {
  document.getElementById('appFavicon').setAttribute('href', 'favicon_sun.ico');
  BaseUrl = ibmUrl;
}
var lastImageUpdate = 0;
var analytics = false;
var plot;
var droop = null; // URL param "1" to enable special test code. If "2" will search for last droop.
var droopImage = 'http://i.imgur.com/ZcNoh9m.png';
var stopImage =
  'https://img.clipartfest.com/0f4cbe56f78689412ff7a6ad5a1dd4e4_stop-sign-clipart-clipart-of-stop-sign_512-309.png';
var format = 'solar';
// default 36 hours in seconds
var period = 36 * 60 * 60;
var clickback = 1.5; // param integer, clicking in image moves back number of days
var min_measure = 2 * 60 * 60 * 1000;
// 0.5 degree / 5 mins
var max_change = 0.5 / (5 * 60 * 1000);
var globalDate = null;
var start_date = null;
var start_time = null;
var data_query = null;
var notes_query = null;
var groupLevel = 5;
var dseries = {};
var is_touch_device = 'ontouchstart' in document.documentElement;
var sieve_interval = 5; // in minutes
// wine/stereo era 7/26/2014 8PM - 9/4/2014 5PM
var erastart = new Date(Date.UTC(2014, 6, 27, 2, 0));
var eraend = new Date(Date.UTC(2014, 8, 4, 21, 43));

var swapStart = new Date(Date.UTC(2016, 11, 13, 19, 15));
var swapEnd = new Date(Date.UTC(2016, 11, 31, 19, 15));
var swap2Start = new Date(Date.UTC(2017, 1, 1, 18, 0));
var swap2End = new Date(Date.UTC(2017, 1, 2, 18, 31));
// Array of sensor translations, in order from the most recent.
// Use null end to mean from now on,
// use null start to mean from the beginning (not needed)
var translate = {
  STOutTemp: [
    {
      end: null,
      start: new Date(Date.UTC(2019, 0, 6, 0, 14)),
      val: 'GuestTemp',
    },
    {
      end: new Date(Date.UTC(2018, 6, 1, 18, 20)),
      start: new Date(Date.UTC(2016, 11, 30, 18, 15)),
      val: 'WineTemp',
    },
    {
      end: new Date(Date.UTC(2016, 11, 30, 18, 15)),
      start: new Date(Date.UTC(2016, 10, 22, 8, 15)),
      val: null,
    },
  ],
  STThermostat: [
    {
      end: null,
      start: new Date(Date.UTC(2018, 6, 7, 16, 28)),
      val: 'STLRMotion',
    },
    {
      end: new Date(Date.UTC(2018, 6, 7, 16, 28)),
      start: null,
      val: 'STThermostat',
    },
  ],
  STInTemp: [
    {
      end: null,
      start: new Date(Date.UTC(2016, 11, 30, 2, 5)),
      val: 'STThermostat',
    },
    {
      end: new Date(Date.UTC(2016, 11, 30, 2, 5)),
      start: new Date(Date.UTC(2016, 10, 18, 16, 0)),
      val: null,
    },
    {
      end: new Date(Date.UTC(2016, 10, 18, 16, 0)),
      start: new Date(Date.UTC(2016, 5, 1, 23, 0)),
      val: 'WineTemp',
    },
  ],
  OutTemp: [
    {
      end: null,
      start: new Date(Date.UTC(2016, 11, 30, 20, 0)),
      val: 'OutTemp',
    },
    {
      end: new Date(Date.UTC(2016, 11, 30, 20, 0)),
      start: new Date(Date.UTC(2016, 11, 21, 17, 0)),
      val: null,
    },
    {
      end: new Date(Date.UTC(2016, 11, 21, 17, 0)),
      start: new Date(Date.UTC(2016, 5, 1, 23, 0)),
      val: 'GrainTemp',
    },
    {
      end: new Date(Date.UTC(2016, 5, 1, 23, 0)),
      start: new Date(Date.UTC(2014, 8, 4, 21, 43)),
      val: 'WineTemp',
    },
  ],
};

var predictFields = [
  'accu',
  'accudaily',
  'darksky',
  'darksky_scaled',
  'wxunderground',
  'twcdaily',
  'openwxmap',
];

function translateProp(dat, val) {
  if (translate.hasOwnProperty(val)) {
    var trans = translate[val];
    for (var i = 0; i < trans.length; i++) {
      if (
        (!trans[i].end || dat < trans[i].end) &&
        (!trans[i].start || dat >= trans[i].start)
      ) {
        val = trans[i].val;
        break;
      }
    }
  }
  return val;
}

var changeTabFromJS = false;
$('a[data-toggle="pill"]').on('shown', function (e) {
  format = e.target.id;

  if (Object.keys(d).length > 0) {
    var url = updateParam('view', format);
    if (!changeTabFromJS) {
      newState(url);
      plotData(false);
    }
    changeTabFromJS = false;
  }
});
$('a[data-toggle="modal"]').on('show', function (e) {
  //    console.log(e);
});
$('a.carousel-control.left').click(function (e) {
  if (clickback) {
    globalDate = prevDate(globalDate, clickback);
    getDataPlot(period, globalDate, groupLevel, false);
    return false;
  }
});
$('a.carousel-control.right').on('click', function (e) {
  if (clickback) {
    globalDate = prevDate(globalDate, '-' + clickback);
    getDataPlot(period, globalDate, groupLevel, false);
    return false;
  }
});

function setPlaceholderHeight() {
  placeholder = $('#placeholder');
  var placeholderParent = placeholder.parent();
  // initial bias leaves extra space at bottom on desktop but
  // works better on iphone 4s and nexus 7
  var height = -19;
  height -= parseInt($('body').css('padding-top'), 10);
  // console.log(height);
  placeholderParent.siblings().each(function () {
    height -= $(this).outerHeight();
  });
  placeholder.siblings().each(function () {
    height -= $(this).outerHeight();
  });
  height -= parseInt(placeholderParent.css('padding-top'), 10);
  height -= parseInt(placeholderParent.css('padding-bottom'), 10);
  height += window.innerHeight;
  // console.log(height);
  placeholder.css('height', height <= 0 ? 100 : height + 'px');
}
var updateLegendTimeout = null;
var latestPosition = null;

function updateLegend() {
  updateLegendTimeout = null;
  // called to initialize with null latestPosition
  var pos = latestPosition || { x: 100000, y: 100000 };
  var posx = pos.x;

  var axes = plot.getAxes();
  if (
    pos.x < axes.xaxis.min ||
    pos.x > axes.xaxis.max ||
    pos.y < axes.yaxis.min ||
    pos.y > axes.yaxis.max
  ) {
    // If mouse outside of chart, set date to the right end.
    posx = axes.xaxis.max;
    // Preset period dialog selection to 'now'
    $('input:radio[name=dateRadios]')[0].checked = true;
  } else {
    // preselect "Date" in settings dialog now that a time is picked
    $('input:radio[name=dateRadios]')[1].checked = true;
  }

  var i,
    j,
    dataset = plot.getData();
  var best_date = 0;
  var best_length = 0;
  for (i = 0; i < dataset.length; ++i) {
    var series = dataset[i];
    if (series.label == 'Valve=xxxxxx') {
      //console.log(series);
      //continue;
    }
    if (series.data.length < 1) continue;
    // find the nearest points, x-wise
    for (j = 0; j < series.data.length; ++j)
      if (series.data[j][0] > posx) break;

    // don't need to interpolate, just pick a value.
    var x,
      y,
      p1 = series.data[j - 1],
      p2 = series.data[j];
    if (p1 == null) {
      y = p2[1];
      x = p2[0];
    } else {
      y = p1[1];
      x = p1[0];
    }

    var legends = $('#placeholder .legendLabel');

    if (series.label == 'Valve=xxxxxx') {
      legends.eq(i).text(series.label.replace(/=.*/, '= ' + y));
    } else {
      var dpoint = /pump/.test(series.label) ? 0 : 1;
      legends.eq(i).text(series.label.replace(/=.*/, '= ' + y.toFixed(dpoint)));
    }

    var ddate = new Date(Date.parse(x));

    // search for the series with the most accurate date points
    // in the region of interest. Assume more points === most accurate MOL
    if (series.data.length > best_length) {
      best_length = series.data.length;
      best_date = ddate;
    }
  }
  if (best_date) {
    $('#hoverdata').text(best_date.toString().replace(/GMT.*$/, ''));
    $('#dateField').val(best_date.toLocaleString('en-US', { hour12: false }));
  }
}

function makeKey(date) {
  return (
    '[' +
    date.getUTCFullYear() +
    ',' +
    date.getUTCMonth() +
    ',' +
    date.getUTCDate() +
    ',' +
    date.getUTCHours() +
    ',' +
    Math.floor(date.getUTCMinutes() / sieve_interval) +
    ',' +
    date.getUTCMinutes() +
    ']'
  );
}

function dayNoon(dat, minutes) {
  // If prediction was made the night before, add one day
  // to get the date the prediction was for. Otherwise
  // the prediction was made early AM the same day
  var incr = dat.getHours() > 12 ? 1 : 0;
  return new Date(
    dat.getFullYear(),
    dat.getMonth(),
    dat.getDate() + incr,
    12,
    minutes
  );
}
var d = {}; //Collection of value arrays

// for state stuff: http://jsfiddle.net/yz30jjpz/
// pass null for date if time now.
// period in seconds.
function getDataPlot(period, date, group_level, feed) {
  if (!feed) {
    changes = false;
    pollSignal(false);
  }
  var end = date ? date : new Date();
  start_time = end.getTime() - period * 1000; /* milliseconds */

  start_date = new Date(start_time);

  if (group_level == 0) {
    //Auto: use hours resolution if > 10 days
    group_level = period > 10 * 24 * 60 * 60 ? 4 : 5;
  }
  var url = BaseUrl;
  url += '/wxd/_design/app/';
  url += '_view/byDate?group_level=' + group_level.toFixed(0);
  url += '&startkey=' + makeKey(start_date);
  if (date) {
    url += '&endkey=' + makeKey(end);
  }
  console.log(url);
  // clear data before reloading
  data_query = $.getJSON(url);
  // Now get the pump valve data

  notes_query = new $.Deferred();
  notes_query.resolve([{ rows: [] }]);

  var legends;
  $.when(data_query, notes_query).done(
    function (jstuff, notes) {
      dseries['solar'] = [];
      dseries['temps'] = [];
      dseries['all'] = [];
      dseries['predict'] = [];

      //console.log(JSON.stringify(notes[0]));
      d = [];
      // Raw Fields
      d['GarageTemp'] = [];
      d['StorageTemp'] = [];
      d['ShrineTemp'] = [];
      d['OutTemp'] = [];
      d['InTemp'] = [];
      d['BackTemp'] = [];
      d['OutProbe'] = [];
      d['InProbe'] = [];
      d['BackProbe'] = [];
      d['OutHumidity'] = [];
      d['InHumidity'] = [];
      d['BackHumidity'] = [];
      d['Collector'] = [];
      d['TankBottom'] = [];
      d['TankTop'] = [];
      d['Hydronics'] = [];
      d['SolarPump'] = [];
      d['InjPump'] = [];
      d['STOutTemp'] = [];
      d['STInTemp'] = [];
      d['STOutHumidity'] = [];
      d['STInHumidity'] = [];
      // Abstract translations
      d['STSlabTemp'] = [];
      d['WineTemp'] = [];
      d['GuestTemp'] = [];
      d['StereoTemp'] = [];
      d['GrainTemp'] = [];
      d['STThermostat'] = [];
      d['STLRMotion'] = [];
      d['Notes'] = [];
      d['nws'] = [];
      d['accu'] = [];
      d['accudaily'] = [];
      d['darksky'] = [];
      d['darksky_scaled'] = [];
      d['wxunderground'] = [];
      d['twcdaily'] = [];
      d['openwxmap'] = [];

      // Hmmm. Why does jstuff have its data buried in an array when
      // $.when() has 2 args but not when it has one arg?
      // and notes doesn't. WTF?
      jstuff[0]['rows'].forEach(function (stuff) {
        var kstuff = stuff['key'];
        // 5th field is 1/12's of an hour. Translate it to minutes.
        //
        var dat = new Date(
          Date.UTC(
            kstuff[0],
            kstuff[1],
            kstuff[2],
            kstuff[3],
            group_level == 4
              ? 0
              : group_level == 6
                ? kstuff[5]
                : kstuff[4] * sieve_interval
          )
        );

        //            console.log( dat.toString())
        //            console.log(stuff["value"]);

        for (var val in stuff['value']) {
          // Compute the average
          var avg = stuff['value'][val][0] / stuff['value'][val][1];

          // Round to nearest 10% to resemble real step values
          if (/Pump/.test(val)) {
            avg = Math.round(avg / 10) * 10;
          } else if (/STOutTemp/.test(val)) {
            if (avg > 100.0) {
              avg = 100.0;
            }
          }
          // fix Indoor/Outdoor TX60 which inadvertently were swapped
          if (
            val === 'InTemp' &&
            ((dat < swapEnd && dat >= swapStart) ||
              (dat < swap2End && dat >= swap2Start))
          ) {
            val = 'OutTemp';
          }

          if (val === 'WineTemp') {
            if (
              (dat < swapEnd && dat >= swapStart) ||
              (dat < swap2End && dat >= swap2Start)
            ) {
              // reswap
              val = 'InTemp';
            } else {
              // The document ID should never have been changed
              // from Out to Wine when created by wx_get.rb
              val = 'OutTemp';
            }
          }
          // wine/stereo era 7/26/2014 8PM - 9/4/2014 3PM
          if (dat < eraend && dat >= erastart) {
            if (val == 'InTemp') {
              val = 'WineTemp';
            } else if (val == 'OutTemp') {
              val = 'StereoTemp';
            }
          }

          val = translateProp(dat, val);

          if (val) {
            d[val].push([dat, avg]);
          }
        }
      });
      var crosshair = null;
      if (droop) {
        var curve = processCollector(d['Collector']);
        if (droop == 1) {
          $('div.carousel-inner>.active>img')
            .attr('src', curve ? stopImage : droopImage)
            .attr('height', '30')
            .attr('width', '100')
            .css({ marginLeft: '400px' });
        } else if (droop == 2 && !curve) {
          // keep looking
          globalDate = prevDate(globalDate, clickback);
          getDataPlot(period, globalDate, groupLevel, false);
          return;
        }

        crosshair = curve;
        //console.log("Failed at time " + curve);
      }
      dseries['solar'].push(
        { data: d['Collector'], label: 'Collector = 000.0', color: 2 },
        { data: d['TankBottom'], label: 'Tank bottom = 000.0', color: 1 },
        { data: d['TankTop'], label: 'Tank top = 000.0', color: 3 },
        {
          data: d['SolarPump'],
          label: 'Solar pump = 000',
          color: 5,
          lines: { steps: true },
        },
        {
          data: d['InjPump'],
          label: 'Injection pump = 000',
          color: 0,
          lines: { steps: true },
        }
      );
      dseries['solar'].push({
        data: d['Hydronics'],
        label: 'Hydronics = 000.0',
        color: 4,
      });

      var alltemps = [
        {
          data: d['StereoTemp'],
          label: 'Stereo = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['GrainTemp'],
          label: 'Grain = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['GuestTemp'],
          label: 'Guest = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['WineTemp'],
          label: 'Wine = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['STOutTemp'],
          label: 'Out Temp = 000.0',
          curvedLines: { active: true, apply: true },
        },
        {
          data: d['STInTemp'],
          label: 'In Temp = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['STThermostat'],
          label: 'Thermostat = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['STLRMotion'],
          label: 'Living Room = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['InTemp'],
          label: 'Room (TX-60) = 000.0',
          lines: { show: true },
          curvedLines: { active: true, apply: true },
        },
        {
          data: d['GarageTemp'],
          label: 'Garage = 000.0',
          lines: { show: true },
          curvedLines: { active: true, apply: true },
        },
        {
          data: d['StorageTemp'],
          label: 'Storage = 000.0',
          lines: { show: true },
          curvedLines: { active: true, apply: true },
        },
        {
          data: d['ShrineTemp'],
          label: 'Shrine = 000.0',
          lines: { show: true },
          curvedLines: { active: true, apply: true },
        },
        {
          data: d['OutTemp'],
          label: 'Carport = 000.0',
          curvedLines: { apply: true },
        },
        {
          data: d['BackTemp'],
          label: 'Back Patio = 000.0',
          curvedLines: { apply: true },
        },
        //                              {data: d["InHumidity"], label:'Inside Hum = 000'},
        //                              {data: d["STOutHumidity"], label:'Outside Hum= 000'}
        { data: d['InProbe'], label: 'Slab = 000' },
      ];

      for (var i = 0; i < alltemps.length; i++) {
        //console.log( "label: " + alltemps[i].label + " length: " + alltemps[i].data.length);
        if (alltemps[i].data.length) {
          dseries['temps'].push(alltemps[i]);
        }
      }
      var xtemps = [
        {
          data: d['STOutTemp'],
          label: 'Out Temp = 000.0',
          curvedLines: { active: true, apply: true },
        },
        { data: d['OutTemp'], label: 'Out (TX-60) = 000.0' },
        { data: d['InTemp'], label: 'Room (TX-60) = 000.0' },
        { data: d['InProbe'], label: 'Slab = 000' },
      ];
      dseries['all'] = [].concat(dseries['solar']);

      for (var i = 0; i < xtemps.length; i++) {
        if (xtemps[i].data.length) {
          dseries['all'].push(xtemps[i]);
        }
      }

      d['predict'] = [];
      var sum = 0;
      var val = d['SolarPump'][0][1];
      var period1 = d['SolarPump'][0][0];
      var prev_date = period1;

      d['SolarPump'].forEach(function (x, i, arr) {
        dat = x[0];
        if (prev_date.getDate() === dat.getDate() && i !== arr.length - 1) {
          if (val !== x[1]) {
            var mins = (dat.getTime() - period1.getTime()) / (1000 * 60);
            sum += mins * val;
            //console.log("Accumulating val for minutes for sum", val, minutes, sum)
            period1 = dat;
          }
        } else {
          // scale down: 480 minutes in a solar day, max percent is typically 50
          // heuristic!
          d['predict'].push([
            new Date(
              prev_date.getFullYear(),
              prev_date.getMonth(),
              prev_date.getDate(),
              12
            ),
            sum / 170,
          ]);
          sum = 0;
        }
        val = x[1];
        prev_date = dat;
      });
      dseries['predict'].push(
        {
          data: d['predict'],
          label: 'Percent-minutes = 000.0',
          color: 2,
          lines: { show: true },
          points: { show: true },
          curvedLines: {
            apply: false,
            active: false,
          },
        },
        {
          data: d['Notes'],
          label: 'Sunny = 000.0',
          lines: { show: false },
          points: { show: true },
          curvedLines: {
            apply: false,
            active: false,
          },
        }
      );
      predictFields.forEach(function (field) {
        if (d[field].length) {
          dseries['predict'].push({
            data: d[field],
            label: field + ' = 000.0',
            lines: { show: false },
            points: { show: true },
            curvedLines: {
              apply: false,
              active: false,
            },
          });
        }
      });
      //      console.log(dseries['predict']);

      if (feed) {
        //console.log('Feed is ' + feed);
        changes = true;
        pollSignal(true);
        longpoll('now');
      }

      plotData(crosshair);
    }.bind(this)
  );
}

function plotData(crosshair) {
  // clear the legend table before redrawing
  //  $('#placeholder table').remove();
  plot = $.plot($('#placeholder'), dseries[format], {
    series: {
      shadowSize: 0,
      curvedLines: {
        apply: true,
        active: true,
        monotonicFit: true,
      },
    },
    xaxes: [
      { mode: 'time', timezone: 'browser' },
      { mode: 'time', timezone: 'browser' },
    ],
    yaxes: [{}, { reserveSpace: true, show: false }],
    crosshair: { mode: 'x' },
    grid: {
      hoverable: true,
      autoHighlight: false,
      borderWidth: 1,
      margin: { left: window.innerWidth < 900 ? -30 : 0, bottom: 10 },
    },
    legend: { position: 'nw', show: true },
  });
  if (crosshair) {
    plot.setCrosshair({ x: crosshair });
  }
  legends = $('#placeholder .legendLabel');
  legends.each(function () {
    // fix the widths so they don't jump around
    $(this).css('width', $(this).width());
  });
  latestPosition = null;
  updateLegend(); // initialize legend with values at r. end of chart
}

var changes = false;

function longpoll(last_seq) {
  // http://schinckel.net/2012/01/22/jquery-long-poll-for-couchdb-changes./
  var url = BaseUrl;
  url += '/wxd/_changes?feed=longpoll&include_docs=true';
  // If we don't have a sequence number, then see where we are up to.
  // console.log('Starting longpoll' + Date());
  if (last_seq) {
    url = url + '&since=' + last_seq;
  }
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    success: function (data) {
      // Now we need to see what to do with the data.
      if (data) {
        if (data.results.length && changes) {
          $(document).trigger('longpoll-data-wxd', [data.results]);
        }
        // And set up the re-run of the fetch query.
        if (changes) {
          longpoll(data.last_seq);
        }
      }
    },
  });
}

function pollSignal(flag) {
  //  console.log('pollSignal: ', flag);
  var color = flag ? '#D99B79' : 'transparent';
  $('#hoverdata').css({ backgroundColor: color });
  $('.carousel').carousel(flag ? 'pause' : 'cycle');
}

$(document).ready(function () {
  updateImage();
  droop = $.urlParam('droop');
  if (droop) {
    clickback = '1';
    globalDate = globalDate ? globalDate : new Date();
    // force to 0000
    globalDate = new Date(
      globalDate.getFullYear(),
      globalDate.getMonth(),
      globalDate.getDate(),
      0
    );
    period = 8 * 60 * 60;
    $('#formHours').val('8');
  } else {
    var end = $.urlParam('end');
    if (end) {
      end = new Date(Date.parse(end));
      if (
        Object.prototype.toString.call(end) === '[object Date]' &&
        !isNaN(end.getTime())
      ) {
        /* Valid Date */
        globalDate = end;
      }
    }
    var per = parseInt($.urlParam('days'), 10);
    if (per && !isNaN(per)) {
      period = per * 24 * 60 * 60;
    } else {
      period = 0;
    }
    per = parseInt($.urlParam('hours'), 10);
    if (per && !isNaN(per)) {
      period += per * 60 * 60;
    } else {
      period = period != 0 ? period : 36 * 60 * 60; // default
    }
    var click = $.urlParam('clickback');
    if (click) {
      clickback = click;
    } else {
      clickback = period / (24 * 60 * 60);
    }

    var level = parseInt($.urlParam('groupLevel'), 10);
    if (level && !isNaN(level) && level >= 0 && level <= 6) {
      groupLevel = level;
    } else {
      groupLevel = 0.0; // auto
    }
    var view = $.urlParam('view');
    if (['solar', 'temps', 'all', 'predict'].includes(view)) {
      format = view;
      switchTab(view);
    } else {
      format = 'solar'; // default
    }
  }
  var initialState = {
    globalDate: globalDate,
    period: period,
    groupLevel: groupLevel,
    clickback: clickback,
    format: format,
  };
  history.replaceState(initialState, '', document.location.href);
  window.onpopstate = function (event) {
    var state = event.state;
    if (!state) {
      state = {
        globalDate: null,
        period: 36 * 60 * 60,
        groupLevel: 5,
        clickback: 1.5,
        format: 'solar',
      };
    }
    var getNewData =
      state.globalDate != globalDate ||
      state.period != period ||
      state.groupLevel != groupLevel ||
      state.clickback != clickback;

    var formatChanged = state.format != format;

    globalDate = state.globalDate;
    period = state.period;
    groupLevel = state.groupLevel;
    clickback = state.clickback;
    format = state.format;

    if (getNewData) {
      getDataPlot(period, globalDate, groupLevel, false);
    } else {
      if (formatChanged) {
        plotData(false);
        switchTab(format);
      }
    }
  };
  // preselect "Now" in settings dialog until a time is picked
  $('input:radio[name=dateRadios]')[0].checked = true;
  setPlaceholderHeight();
  getDataPlot(period, globalDate, groupLevel, false);
  $('#placeholder').bind('plothover', function (event, pos, item) {
    latestPosition = pos;
    if (!updateLegendTimeout)
      updateLegendTimeout = setTimeout(updateLegend, 50);
  });

  // Select datefield radio when clicking in datefield
  $('#dateField').focus(function () {
    $('input:radio[name=dateRadios]')[1].checked = true;
  });
  // And vice-versa
  $('#radioDatefield').click(function () {
    $('#dateField').focus();
  });

  // Throw up settings dialog on screen click
  // but don't do it on touch screen
  var initstr = 'Touch chart to display readout.';
  if (!is_touch_device) {
    $('#placeholder').mousedown(function () {
      $('#settingsModal').modal('toggle');
    });
    initstr = 'Move pointer over graph to display readout.';
  }
  $(document).bind('longpoll-data-wxd', function (evt, data) {
    // do something with data here.
    // This one will be only for the database named <database>.
    //$('.carousel').carousel('next');
    // Refresh image
    updateImage();
    data.forEach(function (obj) {
      if (obj.id[0] === '_') {
        //        console.log('Design Doc, skipping');
      } else {
        // most of this is copied from design doc ddoc.views.byDate
        var doc = obj.doc;
        var sp = doc._id.split('.');
        var dat = new Date(Date.parse(sp[0]));
        var unit = sp[1];
        var valhash = {};
        /*         console.log(doc);*/
        // Compute property names and insert in valhash
        // make sure id has a . in it
        if (sp[0] != doc._id) {
          if (unit != 'DL2') {
            if (unit == 'Notes') return;
            for (var k in doc) {
              if (k != 'Probe' && k != 'Temp' && unit != 'ST') continue;
              if (k.charAt(0) == '_') continue;
              valhash[unit + k] = Number(doc[k]);
            }
          } else {
            for (var k in doc) {
              if (k.charAt(0) == '_') continue;
              valhash[k] = Number(doc[k]);
            }
          }
        }
        // send values to graph arrays
        for (var val in valhash) {
          var newval = translateProp(dat, val);
          //          //console.log(' Prop ' + newval + ': ' + valhash[val]);
          if (newval) {
            d[newval].shift();
            d[newval].push([dat, valhash[val]]);
          }
        }
        plotData(false);
      }
    });
  });

  // wait till doc ready to display instructions
  $('#hoverdata').text(initstr);

  $('#mountain, footer').click(function () {
    // only makes sense if time is 'now'
    // no sense reload exactly the same data...
    /*     console.log('Carousel clicked');*/
    var feed = changes;
    if (changes) {
      // stop feed right away
      changes = !changes;
      pollSignal(false);
      /*       console.log('Stopping longpoll');*/
    }
    // but don't start it until refresh is done

    if (globalDate == null) getDataPlot(period, globalDate, groupLevel, !feed);
  });

  // Validate
  // http://bassistance.de/jquery-plugins/jquery-plugin-validation/
  // http://docs.jquery.com/Plugins/Validation/
  // http://docs.jquery.com/Plugins/Validation/validate#toptions
  $('#settings-form').validate({
    debug: true,
    rules: {
      // need to do some kind of date-time check
      formHours: { require_from_group: [1, '.period'] },
      formDays: { require_from_group: [1, '.period'] },
      datefield: {
        required: {
          depends: function (element) {
            return $('#radioDatefield:checked');
          },
        },
        date: {
          depends: function (element) {
            return $('#radioDatefield:checked');
          },
        },
      },
    },

    highlight: function (label) {
      $(label).closest('.control-group').addClass('error');
    },
    success: function (label) {
      label
        .text('OK!')
        .addClass('valid')
        .closest('.control-group')
        .addClass('success')
        .closest('.control-group')
        .removeClass('error');
    },
    submitHandler: function (form) {
      // do other stuff for a valid form
      // Get end date
      var myDate = null; // leave as null if time is "Now"
      var url = new URL(window.location);
      var error = false;
      if ($('input:radio[name=dateRadios]:checked').val() == 'newDate') {
        myDate = new Date(Date.parse($('#dateField').val()));
        if (
          Object.prototype.toString.call(myDate) !== '[object Date]' ||
          isNaN(myDate.getTime())
        ) {
          alert('Invalid Date');
          return false;
        } else {
          url = updateParam('end', myDate.toISOString(), url);
        }
      }
      // Get period
      var myPeriod = 0;
      // already validated as number by html5
      var hours = $('#formHours').val();
      if (hours != '') {
        myPeriod += hours * 60 * 60;
        url = updateParam('hours', hours, url);
      }
      var days = $('#formDays').val();
      if (days != '') {
        myPeriod += days * 24 * 60 * 60;
        url = updateParam('days', days, url);
      }
      // Get resolution
      groupLevel = Number($('input:radio[name=resRadios]:checked').val());
      //            console.log(groupLevel);
      url = updateParam('groupLevel', groupLevel, url);
      if (myPeriod == 0) {
        alert('Period fields not filled in');
        return false;
      }
      period = myPeriod;
      clickback = period / (24 * 60 * 60);
      globalDate = myDate;
      newState(url);
      $('#settingsModal').modal('toggle');

      //            console.log("Valid form");
      getDataPlot(period, globalDate, groupLevel, false);

      return false;
    },
  }); // end set validate options
}); // end document.ready
