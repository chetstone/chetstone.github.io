## working code for acme.dewachen.org

This github repo (chetstone.github.io) is the working code for acme.dewachen.org.

The gesar clone is at /opt/homebrew/var/www/chetstone.github.io  (linked to ~/prj/dewachenapp) and is the working code for
c2.dewachen.org (192.168.108.75) and c3.dewachen.org (10.147.17.212). These sites are only available on the local LAN or via zerotier.

When developing, best to work directly on gesar. I found Chrome works a lot better than Safari for me.

Push the changes to github, which will update acme.dewachen.org.

### NOTE:
When adding new data series, add it here before adding it to the database.
  This component does not handle unknown data.

#### The name of the value here is the concatenation of the sensor name and the attribute.
e.g.
the Temp attribute of 2023-01-11T01:58:00Z.Garage
is called GarageTemp here (js/app.js)

#### NOTE: the byDate MapReduce function suppresses Humidity-- only returns Probe and Temp values.
(So why are we storing humidity in the db???)

### URL PARAMS:

* end=<date> sets end date of the graph ('now' means now)
* day=<days> amount of time to show
* hours=<hours> amount of time to show (added to days)
* groupLevel=<1 to 6> sets couchdb grouplevel (resolution i think?)
* clickback=#  does nothing because the carousel buttons no longer exist
* view=<temps, solar, all, predict>
* droop=<1 or 2> seems to search for last droop
