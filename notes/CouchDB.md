# CouchDB on Vajrakumara

Configured November 6, 2026; verified with CouchDB 3.5.3.
Homebrew manages the user service, which starts at login.

## Persistent configuration

- Edit `/opt/homebrew/etc/couchdb/local.ini` for local settings. This is a
  regular file outside Homebrew's versioned Cellar directory.
- Homebrew supplies the current defaults at
  `/opt/homebrew/opt/couchdb/etc/default.ini`.
- `/Users/chet/.homebrew/services/couchdb.env` contains this single line
  (without quotation marks):

```text
COUCHDB_INI_FILES=/opt/homebrew/opt/couchdb/etc/default.ini /opt/homebrew/etc/couchdb/local.ini
```

Homebrew includes that environment setting whenever it generates the service.
CouchDB reads the defaults first, then the persistent local settings.
Both the local settings and environment file have permissions `600`.

The service uses `/opt/homebrew/etc/couchdb/local.ini`, rather than the
Homebrew-created `/opt/homebrew/etc/local.ini` symlink.
Database files remain in `/opt/homebrew/var/couchdb/data`.

## Upgrade and restart

Run as `chet`, without `sudo`:

```bash
brew upgrade couchdb
brew services restart couchdb
brew services info couchdb
curl http://127.0.0.1:5984/
```

Confirm the service is running and the HTTP response reports the expected
version. No special restart flags or custom LaunchControl job are needed.

This setup preserves the admin and other local settings when an upgrade
replaces the versioned installation, avoiding the missing-admin startup failure
encountered during the 3.5.2 to 3.5.3 upgrade.
