Updating

This github repo (chetstone.github.io) is the working code for acme.dewachen.org.

The digital ocean clone is at /usr/share/nginx/site and is the working code
for couch.dewachen.org

NOTE:

When adding new data series, add it here before adding it to the database.
This component does not handle unknown data.

Also note:

The name of the value here is the concatenation of the sensor name and the attribute.

e.g.

the Temp attribute of 2023-01-11T01:58:00Z.Garage

is called GarageTemp here (js/app.js)

NOTE: the byDate MapReduce function suppresses Humidity-- only returns Probe and Temp values.
So why are we storing humidity in the db???
