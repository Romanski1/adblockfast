/*
  Copyright 2015–2019 Rocketship <https://rocketshipapps.com/>

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see https://www.gnu.org/licenses/.

  Authors (one per line):

    Brian Kennish <brian@rocketshipapps.com>
*/
function populate(style, selector) {
  const SHEET = style.sheet;
  if (SHEET) SHEET.insertRule(selector + ' { display: none !important }', 0);
  else setTimeout(function() { populate(style, selector); }, 0);
}

EXTENSION.sendRequest({shouldInitialize: true}, function(response) {
  const PARENT_HOST = response.parentHost;
  const IS_WHITELISTED = response.isWhitelisted;
  var wereAdsFound;

  if (PARENT_HOST) {
    const SELECTOR = SELECTORS[PARENT_HOST];

    if (SELECTOR) {
      if (!IS_WHITELISTED) {
        const STYLE = document.createElement('style');
        (document.head || document.documentElement).insertBefore(STYLE, null);
        populate(STYLE, SELECTOR);
      }

      onReady(function() {
        if (document.querySelectorAll(SELECTOR).length) wereAdsFound = true;
      });
    }

    onReady(function() {
      const IFRAMES = document.getElementsByTagName('iframe');
      const IFRAME_COUNT = IFRAMES.length;

      for (var i = 0; i < IFRAME_COUNT; i++) {
        var iframe = IFRAMES[i];
        var childHost = getHost(iframe.src);
        if (childHost != PARENT_HOST)
            for (var j = DOMAIN_COUNT - 1; j + 1; j--)
                if (DOMAINS[j].test(childHost)) {
                  if (!IS_WHITELISTED) {
                    var className = iframe.className;
                    iframe.className =
                        (className ? className + ' ' : '') +
                            'adblockfast-collapsed';
                  }

                  break;
                }
      }

      const IMAGES = document.getElementsByTagName('img');
      const IMAGE_COUNT = IMAGES.length;

      for (i = 0; i < IMAGE_COUNT; i++) {
        var image = IMAGES[i];
        var childHost = getHost(image.src);
        if (childHost != PARENT_HOST)
            for (var j = DOMAIN_COUNT - 1; j + 1; j--)
                if (DOMAINS[j].test(childHost)) {
                  if (!IS_WHITELISTED) {
                    var className = image.className;
                    image.className =
                        (className ? className + ' ' : '') +
                            'adblockfast-collapsed';
                  }

                  break;
                }
      }
    });
  }

  onReady(function() { EXTENSION.sendRequest({wereAdsFound: wereAdsFound}); });
});
