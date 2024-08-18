$.urlParam = function (name) {
  var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
    window.location.href
  );
  if (results == null) {
    return null;
  } else {
    return results[1] || 0;
  }
};

function updateParam(key, value, url) {
  if (!url) {
    url = new URL(window.location);
  }
  if ('URLSearchParams' in window) {
    url.searchParams.set(key, value);
  }
  return url;
}

function switchTab(view) {
  var idString = '#myTab a[data-target="' + view + '"]';
  changeTabFromJS = true;
  $(idString).click();
}
function newState(url) {
  var state = {
    globalDate: globalDate,
    period: period,
    groupLevel: groupLevel,
    clickback: clickback,
    format: format,
    changes: changes,
  };
  console.log('pushState called with state: ', JSON.stringify(state));
  history.pushState(state, '', url);
}
window.onpopstate = function (event) {
  var state = event.state;
  console.log('onPopState called with state: ', JSON.stringify(state));

  if (!state) {
    state = {
      globalDate: null,
      period: 36 * 60 * 60,
      groupLevel: 5,
      clickback: 1.5,
      format: 'solar',
      changes: false,
    };
  }
  var getNewData =
    state.globalDate != globalDate ||
    state.period != period ||
    state.groupLevel != groupLevel ||
    state.clickback != clickback ||
    state.changes != changes;

  var formatChanged = state.format != format;

  globalDate = state.globalDate;
  period = state.period;
  groupLevel = state.groupLevel;
  clickback = state.clickback;
  format = state.format;

  if (getNewData) {
    getDataPlot(period, globalDate, groupLevel, state.changes, true);
  } else {
    if (formatChanged) {
      plotData(false);
      switchTab(format);
    }
  }
};

function prevDate(thisDate, incr) {
  var now = new Date();
  if (!thisDate) {
    thisDate = now;
  }
  var date = new Date(
    thisDate.getTime() - parseFloat(incr) * 24 * 60 * 60 * 1000
  );
  if (date.getTime() >= now.getTime()) {
    return null;
  }
  return date;
}

function do_log(arg) {
  console.log(arg);
}

function processCollector(arr) {
  var min = 1000.0;
  var threshold = 2.9;
  var result = null;
  var res = arr.some(function (pt) {
    var dat = new Date(pt[0]);
    if (dat.getHours() >= 17) {
      if (dat.getHours() <= 20) {
        if (pt[1] < min) {
          min = pt[1];
        } else if (pt[1] > min + threshold) {
          result = pt[0];
          return pt[0];
        }
      } else {
        //console.log("After 9 oclock and we're OK");
      }
    }
  });
  return result;
}

function updateImage() {
  var timestamp = new Date().getTime();
  var mountain = document.getElementById('mountain');
  if (timestamp > lastImageUpdate + 10000) {
    lastImageUpdate = timestamp;
    mountain.src =
      'https://storage.googleapis.com/crestonemountain/wisenet.jpg?t=' +
      timestamp;
  }
  console.log(`Updated ${mountain.src}`);
}

function getURLParams() {
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

  var myPeriod = null;
  var days = $.urlParam('days');
  if (days !== null) {
    days = parseInt(days, 10);
    if (!isNaN(days)) {
      myPeriod = days * 24 * 60 * 60;
    }
  }
  var hours = $.urlParam('hours');
  if (hours !== null) {
    hours = parseInt(hours, 10);
    if (!isNaN(hours)) {
      if (myPeriod !== null) {
        myPeriod += hours * 60 * 60;
      } else {
        myPeriod = hours * 60 * 60;
      }
    }
  }
  // now set the global
  period = myPeriod !== null ? myPeriod : period;

  var click = $.urlParam('clickback');
  if (click !== null && (click = parseFloat(click)) && !isNan(click)) {
    clickback = click;
  } else {
    clickback = period / (24 * 60 * 60);
  }

  var level = $.urlParam('groupLevel');
  if (level !== null) {
    level = parseInt(level, 10);
    if (!isNaN(level) && level >= 0 && level <= 6) {
      groupLevel = level;
    } else {
      groupLevel = 0.0; // auto
    }
  }
  var change = $.urlParam('changes');
  if (change !== null) {
    change = parseInt(change, 10);
    if (!isNaN(change) && change >= 0 && change <= 1) {
      changes = !!change;
    }
  }

  var view = $.urlParam('view');
  if (view !== null && ['solar', 'temps', 'all'].includes(view)) {
    format = view;
    switchTab(view);
  } else {
    format = 'solar'; // default
  }
}

function updateChanges() {
  // only makes sense if time is 'now'
  // no sense reload exactly the same data...
  // and we only do longpolling if
  // globalDate is null, i.e. endtime is "now"

  if (globalDate !== null) {
    return;
  }
  if (changes) {
    // stop feed right away
    pollSignal(false);
    console.log('Stopping longpoll');
  }
  // but don't start it until refresh is done
  getDataPlot(period, globalDate, groupLevel, !changes, false);
}
