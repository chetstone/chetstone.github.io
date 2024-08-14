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

function updateParam(key, value, url = new URL(window.location)) {
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
  if (!thisDate) {
    thisDate = new Date();
  }
  return new Date(
    thisDate.getFullYear(),
    thisDate.getMonth(),
    thisDate.getDate() - parseInt(incr, 10),
    thisDate.getHours(),
    thisDate.getMinutes(),
    thisDate.getSeconds()
  );
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
