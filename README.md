Updating

This github repo (chetstone.github.io) is the working code for acme.dewachen.org.

The digital ocean clone is at /usr/share/nginx/site (linked to ~/site) and is the working code for
couch.dewachen.org.

When developing, best to work directly on docean, using emacs in a terminal
window (X emacs or tramp are both slow).

Go to the Cloudflare dashboard, select Dewachen, go to the Caching Configuration
page and turn on development mode. Make sure caching is disabled in the test browser.
I found Chrome works a lot better than Safari for me.

Push the changes to github, which will update acme.dewachen.org.
(Currently I couldn't push directly from docean to github. Had to fetch the latest on Serendipity and then push to there.)

When done, purge the cloudflare cache.

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

URL PARAMS:

end=<date> sets end date of the graph ('now' means now)
day=<days> amount of time to show
hours=<hours> amount of time to show (added to days)
groupLevel=<1 to 6> sets couchdb grouplevel (resolution i think?)
clickback=#  does nothing because the carousel buttons no longer exist
view=<temps, solar, all, predict>
droop=<1 or 2> seems to search for last droop
