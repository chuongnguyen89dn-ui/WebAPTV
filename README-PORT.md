# VELORA 1:1 port status

Branch: `velora-1to1-port`

Implemented in the standalone split shell:
- VELORA-style split layout with draggable divider, swap, fit and fullscreen.
- YouTube URL/video-ID playback in-place, recent history and search adapter.
- Right-side workspace switching between widgets, YouTube playlist/search and map.
- Clock and browser geolocation speed/GPS status.
- Google Maps workspace using the ported `google-map.html`/`google-map.js`; requires an owner-provided Google Maps API key/config and does not copy third-party credentials.
- TV browser with group/channel selection, native HLS on Safari/APTV and Hls.js fallback, playback/mute/volume controls and error/buffering state.

Expected deploy dependencies:
- `api/search.php` or `/api/youtube/search` for keyword YouTube search. Direct YouTube URLs/IDs do not require it.
- `api/tv.php`, `tv.json`, or `channels.json` for TV channels.
- Google Maps API configuration for map/places/routes.

The mirrored original assets under `velora-source/` are retained as behavioral/reference material. No third-party API credentials are copied into this branch.
