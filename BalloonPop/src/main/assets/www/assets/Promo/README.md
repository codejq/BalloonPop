### Promo system overview

#### Features/Description:
- Controls the More Games system.
- Uses a bundled JSON configuration and set of assets that are used on first launch
- At startup, at defined intervals fetches a new config from a PHP server. If that config refers to assets that are not available locally (e.g. new games, A/B icons), they are downloaded
- Tracks popularity of apps with Google Analytics
- Tracks installs with UTM links (e.g. in Play Console can see how many Balloon Pop installs came from Baby Phone users)
- Can perform A/B testing of icons
- Supports embedding 3rd party ad
- Supports multiple publishers (i.e. could in theory let others run the system in their own apps)

#### Folder overview:
Bundle/ contains the pre-installed JSON configuration and assets (app icons and landscape thumbnails for DLC menu scene promo).
Classes/ is various code for fetching, caching, sorting etc
GoogleAnalytics/ is an instance of GA in order to have a separate ID
Images/ contains assets for WIP (ability to group apps with headers in More Games scene)
PromoConfig.lua contains some configuration, mainly sizing, fonts etc.

#### Other locations of interest:
- main.lua contains some init
- Scenes/MenuScene does some processing to figure out if and what to show (icon changes in round-robin fashion)
- Scenes/MoreGamesScene displays the icons, performs A/B testing, tracks clicks via GA and UTM

#### Notes for testing and debugging:
- Logger uses tag "[Promo]" for promo system stuff. E.g. for at top of main.lua, set "local logOnly = 'Promo'" to show only that tag and at the "Dump" (verbose) level of logging
- PromoConfig.lua lets you set "_G.livePromoConfig = true" in order to re-fetch server configuration at every startup
- Simulator Sandbox:
-- Documents/promodata.json contains some local state (rather than embedding in the Userdata state, in case I wanted to let others use it)
-- CachedFiles/promoConfig.json contains the downloaded config and any new assets

