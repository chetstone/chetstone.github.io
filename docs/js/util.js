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

function updateParam(key, value) {
  if ('URLSearchParams' in window) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    history.pushState(null, '', url);
    //  var searchParams = new URLSearchParams(window.location.search);
    // searchParams.set(key, value);
    // window.location.search = searchParams.toString();
  } else {
    console.log('URLSearchParams not supported');
  }
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
      'https://couch.dewachen.org/img/videos/wisenet.jpg?t=' + timestamp;
  }
  console.log(`Updated ${mountain.src}`);
}
