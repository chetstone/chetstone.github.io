const DOdburl = require('../../ssdata/DoceanCreds.json').db;
const IBMdburl = require('../../ssdata/IBMcreds.json').db;
var db;

const DOurl = require('../../ssdata/DoceanCreds.json').url;
const IBMurl = require('../../ssdata/IBMcreds.json').url;
var nano;

var decon = require('couchdeconflict');

// Configure
var useIBM = false;
var getConflicts = false;

if (useIBM) {
  db = require('nano')(IBMdburl);
  nano = require('nano')(IBMurl);
  console.log('Cloudant');
} else {
  db = require('nano')(DOdburl);
  nano = require('nano')(DOurl);
  console.log('Digital Ocean');
}
//var docs = require('./rest.json').rows;

/* var opts = {
 *   url: dburl + 'foo', // last part will be stripped off for bulk post
 *   verbose: true,
 *   docs: docs,
 * };*/

//decon(opts);
if (getConflicts) {
  db.view('app', 'conflicts', {
    /*   limit: 250,*/
    include_docs: false,
  })
    .then(body => {
      console.log(body.rows.length);
    })
    .catch(e => console.log(`Failed getting conflict docs`));
}
/* nano.db.compact('wxd').then(body => {
 *   console.log('Compaction done ', body);
 * });
 * */
db.info().then(body => {
  console.log('got database info', body);
});

nano.request({ db: 'wxd', path: '/_design/app/_info' }).then(body => {
  console.log('got design doc info', body);
});

// Test deleting a deleted conflict
/* db.destroy(
 *   '2014-10-26T22:16:22Z.ST',
 *   '2-8a449f927cb51b06b0b56bf106e60892'
 * ).then(body => {
 *   console.log(body);
 * });*/
