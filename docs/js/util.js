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
  } else {
    console.log('URLSearchParams not supported');
  }
  return url;
}

function switchTab(view) {
  var idString = '#myTab a[data-target="' + view + '"]';
  console.log('showing tab ' + idString);
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
  };
  history.pushState(state, '', url);
}
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
