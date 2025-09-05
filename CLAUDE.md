# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a weather and environmental monitoring web application for acme.dewachen.org. The application displays real-time sensor data including temperature, humidity, solar heating system metrics, and outdoor webcam images in interactive charts.

## Architecture

**Frontend**: Vanilla JavaScript with jQuery, Bootstrap 2.2.2, and Flot charting library
**Backend**: CouchDB database with MapReduce views for data aggregation
**Deployment**: Static files served via nginx, auto-deployed via GitHub Pages

### Key Files

- `docs/index.html` - Main application interface with Bootstrap UI and chart placeholder
- `docs/js/app.js` - Core application logic (1000+ lines):
  - Data fetching from CouchDB views
  - Real-time updates via CouchDB long-polling (`_changes` feed)
  - Chart rendering with Flot.js
  - Sensor data translation and historical corrections
  - URL parameter handling for deep linking
- `docs/js/util.js` - Utility functions for URL params, state management, date handling
- `docs/js/lib/` - Third-party libraries (jQuery plugins, Flot charting)

### Data Architecture

- **CouchDB Integration**: Queries `BaseUrl/wxd/_design/app/_view/byDate` with group-level aggregation
- **Sensor Data**: Temperature, humidity, solar pump status from various IoT sensors
- **Historical Corrections**: Complex sensor translation logic handles hardware changes over time (see `translate` object in app.js:43-112)
- **Real-time Updates**: Long-polling against CouchDB `_changes` feed for live data

### Chart System

The application displays four data views:
- **Solar**: Solar heating system (collector temp, tank temps, pump status)
- **Weather**: Indoor/outdoor temperatures from various sensors
- **All**: Combined solar and key temperature data
- **Predict**: Solar production forecasting (derived from pump runtime)

## Development Commands

**Code Formatting**:
```bash
npx prettier --write .
```

**Local Development**:
- Work directly on the Gesar server at `/opt/homebrew/var/www/chetstone.github.io`
- Test locally on `c2.dewachen.org` or `c3.dewachen.org` (LAN only)
- Use Chrome browser (works better than Safari according to README)
- Push to GitHub to auto-deploy to production

## Important Implementation Notes

### Adding New Sensors
1. Add data series to `d` object initialization (app.js:362-401)
2. Update chart series definitions (app.js:496+ for solar, 519+ for temps)
3. Handle in real-time update processing (app.js:906+)

### Sensor Name Convention
Sensor values use concatenated naming: `{SensorUnit}{Attribute}` (e.g., `GarageTemp`, `STOutHumidity`)

### Historical Data Handling
The `translateProp()` function (app.js:124-138) handles sensor hardware changes over time using date ranges. Critical for data continuity.

### URL Parameters
The application supports deep linking with parameters:
- `end`: End date for chart period
- `days`/`hours`: Time period to display  
- `groupLevel`: CouchDB aggregation level (1-6)
- `view`: Chart type (solar/temps/all/predict)
- `changes`: Enable real-time updates (0/1)

## Code Style

Uses Prettier with:
- Single quotes
- ES5 trailing commas
- No additional configuration beyond package.json