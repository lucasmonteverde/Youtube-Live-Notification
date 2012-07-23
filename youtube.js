/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Slave Jovanovski (slave@google.com)
 *
 */


/**
 * Constructor for a YouTube object.
 * @param {ChromeExOAuth} oauth The authentication object.
 */
YouTube = function(oauth) {
  this.oauth_ = oauth;
  this.feedItems_ = [];
  this.feedMap_ = {};
  this.videoTab_ = null;
  this.options_ = {
    'pollingInterval': localStorage['pollingInterval'] &&
                       parseInt(localStorage['pollingInterval']) ||
                       YouTube.DEFAULT_POLLING_INTERVAL,
    'numFeedItems': localStorage['numFeedItems'] &&
                    parseInt(localStorage['numFeedItems']) ||
                    YouTube.DEFAULT_NUM_FEED_ITEMS,
    'numFeedItemsShown': localStorage['numFeedItemsShown'] &&
                         parseInt(localStorage['numFeedItemsShown']) ||
                         YouTube.DEFAULT_NUM_FEED_ITEMS_SHOWN,
    'unreadCount': localStorage['unreadCount'] ||
                   YouTube.DEFAULT_UNREAD_COUNT_VALUE,
    'openInNewTab': localStorage['openInNewTab'] === 'true' || false,
    'video_uploaded': localStorage['video_uploaded'] === undefined ||
                      localStorage['video_uploaded'] === 'true' ||
                      false,
    'video_favorited': localStorage['video_favorited'] === undefined ||
                       localStorage['video_favorited'] === 'true' ||
                       false,
    'video_rated': localStorage['video_rated'] === undefined ||
                   localStorage['video_rated'] === 'true' ||
                   false,
    'video_liked': localStorage['video_rated'] === undefined ||
                   localStorage['video_rated'] === 'true' ||
                   false,
    'video_commented': localStorage['video_commented'] === undefined ||
                       localStorage['video_commented'] === 'true' ||
                       false,
    'load_friend_feed': localStorage['load_friend_feed'] === undefined ||
                        localStorage['load_friend_feed'] === 'true' ||
                        false,
    'load_subscription_feed':
        localStorage['load_subscription_feed'] === undefined ||
        localStorage['load_subscription_feed'] === 'true' ||
        false,
	'load_live_feed':
        localStorage['load_live_feed'] === undefined ||
        localStorage['load_live_feed'] === 'true' ||
        false
  };
  this.numNewItems_ = 0;
};


/**
 * The oauth object that handles authentication.
 * @type {ChromeExOAuth}
 */
YouTube.prototype.oauth_;


/**
 * Mapping between feed item ids and {'item': feedItem, 'removed': bool}. Used
 * to check whether a feed item with a given id is present in the map and
 * whether it has been removed by the user. Once an item is removed by the user
 * the 'item' key is removed from the object and 'removed' is set to true. A
 * special localStorage key ('rm-' + itemId) is also set to true.
 * @type {Object}
 */
YouTube.prototype.feedMap_;


/**
 * A list of all feed items.
 * @type {Array.<Object>}
 */
YouTube.prototype.feedItems_;


/**
 * The id of the interval used for polling.
 * @type {number}
 */
YouTube.prototype.pollingIntervalId_;


/**
 * The tab where videos are being played.
 * @type {Tab}
 */
YouTube.prototype.videoTab_;


/**
 * Personalized user configs.
 * @type {Object}
 */
YouTube.prototype.options_;


/**
 * The number of items since the last time the user accessed the extension.
 * @type {number}
 */
YouTube.prototype.numNewItems_;


/**
 * The API key for YouTube requests.
 * @type {String}
 */
YouTube.YOUTUBE_API_KEY = 'AI39si4g_K8MuDv5EAPaHO_ylcr7S9J8BqKfqueLVnpftP6Iq7agZKtye_oAWWQ3jpa-n9E-GVwNRwjxIzPxHWdnhKgeLsNcVw';


/**
 * The polling interval for feed items in minutes.
 * @type {number}
 */
YouTube.DEFAULT_POLLING_INTERVAL = 5;  // 5 minutes.


/**
 * The minimum polling interval for feed items in minutes.
 * @type {number}
 */
YouTube.MIN_POLLING_INTERVAL = 1;  // 1 minute.


/**
 * The polling interval for feed items in minutes.
 * @type {number}
 */
YouTube.MAX_POLLING_INTERVAL = 60;  // 1 hour.


/**
 * The default number of feed items to be retrieved.
 * @type {number}
 */
YouTube.DEFAULT_NUM_FEED_ITEMS = 10;


/**
 * The default number of feed items to be shown.
 * @type {number}
 */
YouTube.DEFAULT_NUM_FEED_ITEMS_SHOWN = 20;


/**
 * The default behavior of the unread count. Count new videos only.
 * @type {number}
 */
YouTube.DEFAULT_UNREAD_COUNT_VALUE = 'only_new';


/**
 * The maximum number of feed items to be retrieved.
 * @type {number}
 */
YouTube.MAX_NUM_FEED_ITEMS = 20;


/**
 * The maximum number of feed items to be shown.
 * @type {number}
 */
YouTube.MAX_NUM_FEED_ITEMS_SHOWN = 50;


/**
 * The YouTube domain.
 * @type {string}
 */
YouTube.DOMAIN = 'youtube.com';


/**
 * Feature parameter for the extension. Used for analytics.
 * @type {string}
 */
YouTube.FEATURE_YOUTUBE_FEED_CHROME_EXTENSION = 'ytfce';


/**
 * The prefix URL for a user's channel.
 * @type {string}
 */
YouTube.CHANNEL_PREFIX_URL = 'http://www.youtube.com/user/';


/**
 * The prefix URL for a user's channel.
 * @type {string}
 */
YouTube.WATCH_VIDEO_PREFIX_URL = 'http://www.youtube.com/watch?v=';


/**
 * The prefix URL for a video thumbnail.
 * @type {string}
 */
YouTube.VIDEO_THUMBNAIL_PREFIX_URL = 'http://i.ytimg.com/vi/';


/**
 * The GData URL for the friend feed.
 * @type {string}
 */
YouTube.GDATA_FRIEND_FEED_URL =
    'http://gdata.youtube.com/feeds/api/users/default/friendsactivity';


/**
 * The GData URL for the subscription feed.
 * @type {string}
 */
YouTube.GDATA_SUBSCRIPTION_FEED_URL =
    'http://gdata.youtube.com/feeds/api/users/default/subtivity';


/**
 * The GData URL for the user's feed.
 * @type {string}
 */
YouTube.GDATA_VIDEO_PREFIX_URL = 'http://gdata.youtube.com/feeds/api/videos/';


/**
 * The scheme entry for the event kind.
 */
YouTube.EVENT_KIND_SCHEME =
    'http://gdata.youtube.com/schemas/2007/userevents.cat';


/**
 * The rel entry for the video info.
 */
YouTube.VIDEO_REL = 'http://gdata.youtube.com/schemas/2007#video';


/**
 * Supported event types.
 * @type {Array.<String>}
 */
YouTube.SUPPORTED_EVENT_TYPES = [
    'video_uploaded',
    'video_favorited',
    'video_rated',
    'video_liked',
    'video_commented'
];



/*customs */

YouTube.prototype.subscriptions_ = [];
YouTube.prototype.liveEvents_ = [];
YouTube.prototype.liveEventsMap_ = [];


YouTube.GDATA_SUBSCRIPTION_LIST_URL =
    'http://gdata.youtube.com/feeds/api/users/default/subscriptions';

	
YouTube.GDATA_LIVE_EVENTS =
	'https://gdata.youtube.com/feeds/api/charts/live/events/live_now';

	
YouTube.LIVE_EVENT_SCHEME = 
	'http://gdata.youtube.com/schemas/2007#liveEvent';

YouTube.prototype.getDefaultParams = function(){
	return{
		'parameters' : {
			'alt': 'json',
			'max-results' : this.options_['numFeedItems'],
			'v' : 2,
			'inline': true
		},
		'headers' : {
			'X-GData-Key': 'key=' + YouTube.YOUTUBE_API_KEY
		}
	}
}

/* end custons */



/**
 * Initializes a YouTube object.
 */
YouTube.prototype.initialize = function() {
  this.setVisualState();
  chrome.tabs.onRemoved.addListener(Util.bind(this.onTabRemoved_, this));
};


/**
 * @return {Object} The configuration options.
 */
YouTube.prototype.getOptions = function() {
  return this.options_;
};


/**
 * Logs in the user.
 */
YouTube.prototype.login = function() {
  this.oauth_.authorize(Util.bind(this.onAuthorized_, this));
};



/**
 * Logs out the user.
 */
YouTube.prototype.logout = function() {
  this.oauth_.clearTokens();
  this.setVisualState();
};


/**
 * Starts polling for feed items.
 */
YouTube.prototype.startPolling = function() {
  if (this.pollingIntervalId_) {
    window.clearInterval(this.pollingIntervalId_);
  }
  this.getTheFeed_();
  this.pollingIntervalId_ = window.setInterval(
      Util.bind(this.getTheFeed_, this),
      this.options_['pollingInterval'] * 60000);
};


/**
 * Resets the number of new items.
 */
YouTube.prototype.resetNumNewItems = function() {
  this.numNewItems_ = 0;
  this.setVisualState();
};


/**
 * Marks the feed item as removed and removes it from the feed array and map.
 * @param {string} feedItemId The id of the feed item whose video will be
 *     played.
 */
YouTube.prototype.removeFeedEntry = function(feedItemId) {
  var mapEntry = this.feedMap_[feedItemId];
  if (mapEntry) {
    this.feedItems_.splice(this.feedItems_.indexOf(mapEntry['item']), 1);
    mapEntry['removed'] = true;
    delete mapEntry['item'];  // No need to keep the item anymore.
    localStorage['rm-' + feedItemId] = 'true';  // Persist in localStorage.
  }
  this.setBadgeText_();
};


/**
 * @return {bool} Whether the user is logged in.
 */
YouTube.prototype.isLoggedIn = function() {
  return this.oauth_.hasToken();
};


/**
 * @return {bool} Whether there are feed items for the user.
 */
YouTube.prototype.hasFeedItems = function() {
  return !!this.feedItems_.length;
};


/**
 * @param {Element} feedEntryTemplate The feed entry template.
 * @return {Element} The DOM for the feed.
 */
YouTube.prototype.buildFeedDom = function(feedEntryTemplate) {
  var div = document.createElement('div');
  if (!!this.feedItems_.length) {
    var count = 0;
    var maxItemsToShow = this.options_['numFeedItemsShown'];
    for (var i = 0; i < this.feedItems_.length; ++i) {
      try {
        if (this.shouldShowFeedItem_(this.feedItems_[i], this.options_)) {
          var child = this.buildFeedItemElement_(feedEntryTemplate,
                                                 this.feedItems_[i]);
          if (child) {
            div.appendChild(child);
            ++count;
          }
          if (count == maxItemsToShow) {
            break;
          }
        }
      } catch (e) {
        console.log('Exception ' + e);
      }
    }
  } else {
    var noItems = document.createElement('h2');
    noItems.innerHTML = chrome.i18n.getMessage('messageNoFeedItems');
    div.appendChild(noItems);
  }
  return div;
};


/**
 * Saves the specified options in local storage.
 * @param {Object} options The key/value pairs of options.
 */
YouTube.prototype.saveOptions = function(options) {
  for (var option in options) {
    this.options_[option] = options[option];
    localStorage[option] = options[option];
  }
};


/**
 * Builds a DOM element for a feed item.
 * @param {Element} template The feed entry template.
 * @param {Object} feedItem The feed item for which to build the DOM.
 * @return {Element}
 */
YouTube.prototype.buildFeedItemElement_ = function(template, feedItem) {
  // Grab the metadata from the feed item.
  var itemId = feedItem['id']['$t'];
  var videoId = feedItem['yt$videoid']['$t'];
  var username = feedItem['author'][0]['name']['$t'];
  var eventType = this.getEventType_(feedItem);
  if (!eventType) {
    return null;
  }

  var feedEntryTimestamp = feedItem['updated']['$t'];
  var videoInfo = null;
  var links = feedItem['link'];
  for (var i = 0; i < links.length; ++i) {
    if (links[i].rel == YouTube.VIDEO_REL) {
      videoInfo = links[i]['entry'][0];
    }
  }
  var videoTitle = videoInfo && videoInfo['title'] && videoInfo['title']['$t'];
  var videoTime = videoInfo && 
                  videoInfo['media$group'] &&
                  videoInfo['media$group']['yt$duration'] &&
                  videoInfo['media$group']['yt$duration']['seconds'];
  var videoDescription = videoInfo &&
                         videoInfo['media$group'] &&
                         videoInfo['media$group']['media$description'] &&
                         videoInfo['media$group']['media$description']['$t'];
  var videoAddedTime = videoInfo &&
                       videoInfo['published'] &&
                       videoInfo['published']['$t'];
  var videoViewCount = videoInfo &&
                       videoInfo['yt$statistics'] &&
                       videoInfo['yt$statistics']['viewCount'];
  var videoAuthorUsername = videoInfo &&
                            videoInfo['author'] &&
                            videoInfo['author'][0] &&
                            videoInfo['author'][0]['name'] &&
                            videoInfo['author'][0]['name']['$t'];

  // Prepare the content for the basic DOM for the feed entry.
  var userChannelUrl = Util.channelUrl(username);
  var feedEntryTitle = chrome.i18n.getMessage('eventType_' + eventType,
                                              [userChannelUrl, username]);

  // Build the basic DOM for the feed entry from the template.
  var domFeedEntry = template.cloneNode(true);
  var actionIcon = Util.getFirstElementByClass(domFeedEntry,
                                               'feed-entry-action-icon');
  Util.setCssClass(actionIcon,
                   'feed-entry-action-icon message-sprite ' + eventType);
  Util.setChildHTML(domFeedEntry, 'feed-entry-title-text', feedEntryTitle);
  Util.setChildHTML(domFeedEntry, 'feed-entry-timestamp',
                    '(' + Util.formatTimeSince(feedEntryTimestamp) + ')');
  Util.setName(domFeedEntry, 'feed-entry-item-id', itemId);

  if (videoInfo) {
    // Prepare the content for the video info for the feed entry.
    var videoUrl = Util.videoWatchUrl(videoId);
    var videoAuthorChannelUrl = Util.channelUrl(videoAuthorUsername);
    var videoThumbnailSrc = Util.thumbnailUrl(videoId);
    var formattedViewCount = Util.formatViewCount(videoViewCount);
    var viewCountText = chrome.i18n.getMessage('viewCount',
                                               [formattedViewCount]);

    // Build the video info DOM for the feed entry from the template.
    Util.setImageSrc(domFeedEntry, 'feed-entry-video-img', videoThumbnailSrc);
    Util.setAnchorHref(domFeedEntry, 'feed-entry-video-thumb', videoUrl);
    Util.setChildHTML(domFeedEntry, 'feed-entry-video-time',
                      Util.formatVideoLength(videoTime));
    Util.setAnchorHref(domFeedEntry, 'feed-entry-video-long-title-anchor',
                       videoUrl);
    Util.setChildHTML(domFeedEntry, 'feed-entry-video-long-title-anchor',
                      videoTitle);
    Util.setChildHTML(domFeedEntry, 'feed-entry-video-description',
                      videoDescription);
    Util.setChildHTML(domFeedEntry, 'feed-entry-video-added-time',
                      Util.formatTimeSince(videoAddedTime));
    Util.setChildHTML(domFeedEntry, 'feed-entry-video-num-views',
                      viewCountText);
    Util.setAnchorHref(domFeedEntry, 'feed-entry-video-from-username',
                       videoAuthorChannelUrl);
    Util.setChildHTML(domFeedEntry, 'feed-entry-video-from-username',
                      videoAuthorUsername);
    var videoInfoElement = Util.getFirstElementByClass(
        domFeedEntry,
        'feed-entry-video-cell-template');
    Util.setCssClass(videoInfoElement, 'feed-entry-video-cell');
  }
  Util.setCssClass(domFeedEntry, 'feed-entry');
  return domFeedEntry;
};


/**
 * Sets the objects visual state.
 */
YouTube.prototype.setVisualState = function() {
  //this.setIcon_();
  this.setBadgeText_();
};


/**
 * Whether to count only new videos in the unread count.
 * @return {boolean} Whether to count only new videos in the unread count.
 */
YouTube.prototype.countNewVideosOnly_ = function() {
  return this.options_['unreadCount'] == 'only_new';
}


/**
 * Executed when a user has been authorized.
 */
YouTube.prototype.onAuthorized_ = function() {
  this.setVisualState();
  this.getTheFeed_();
};


/**
 * Gets the feed items from YouTube's GData API server.
 */
YouTube.prototype.getTheFeed_ = function() {
  if (this.oauth_.hasToken()) {
    if (this.options_['load_friend_feed']) {
      this.oauth_.sendSignedRequest(YouTube.GDATA_FRIEND_FEED_URL, Util.bind(this.onFeedReceived_, this) ,  this.getDefaultParams() );
    }
    if (this.options_['load_subscription_feed']) {
      this.oauth_.sendSignedRequest(YouTube.GDATA_SUBSCRIPTION_FEED_URL, Util.bind(this.onFeedReceived_, this) , this.getDefaultParams() );
    }
	if (this.options_['load_live_feed']) {
		/* 
			Pega lista de inscrições; carregar do cache
			Pegar lista de eventos ao vivo;
		*/
		var live_opt_params = this.getDefaultParams();
		delete live_opt_params['parameters']['max-results'];
		
		this.oauth_.sendSignedRequest(YouTube.GDATA_SUBSCRIPTION_LIST_URL, Util.bind(this.onLiveReceived_, this, 'subscribe') , live_opt_params);
		
		this.oauth_.sendSignedRequest(YouTube.GDATA_LIVE_EVENTS, Util.bind(this.onLiveReceived_, this, 'live') , live_opt_params);
	}
  }
};


YouTube.prototype.onLiveReceived_ = function(type, text, xhr) {
	var data = JSON.parse(text);
	
	if (data && data['feed'] && data['feed']['entry']) {
		var feedItems = data['feed']['entry'];
		
		if(feedItems.length > 0){

			//var type = data['feed']['category'][0]['term'] == YouTube.LIVE_EVENT_SCHEME ? 'live' : 'subscribe';

			if( type == 'live' ){
				this.liveEvents_ = feedItems;
			}else{
				this.subscriptions_ = feedItems;
			}
			
			//console.log(this.liveEvents_, this.subscriptions_ );
			
			if(this.subscriptions_.length > 0 && this.liveEvents_.length > 0 ){
				this.checkEventsBySubscriptions();
			}
		}
	}
	//console.log(text);
}

YouTube.prototype.checkEventsBySubscriptions = function() {

	for (var i = 0; i < this.subscriptions_.length; ++i) {
		var sub_username = this.subscriptions_[i]['yt$username']['display'];
		for (var j = 0; j < this.liveEvents_.length; ++j) {
			var event_id = this.liveEvents_[j]['id']['$t'];
			var event_userName = this.liveEvents_[j]['author'][0]['name']['$t'];

			
			if(sub_username == event_userName){
				console.log( this.liveEventsMap_.toString() );
				if ( this.liveEventsMap_.indexOf(event_id) < 0 ){
					this.liveEventsMap_.push( event_id );
					console.log( "added to arr",event_id, this.liveEventsMap_ );
					this.showNotification(event_userName, this.liveEvents_[j]['title']['$t']);
					console.log( "OnLive stream do " + sub_username  );
				}
			}
		}
	}

}
/**
 * Executed when the feed has been received from the GData server.
 * @param {string} text The parsed text from the xhr.
 * @param {XmlHttpRequest} xhr The XmlHttpRequest that finished executing.
 */
YouTube.prototype.onFeedReceived_ = function(text, xhr) {
  var data = JSON.parse(text);
  //console.log(text);

  if (data && data['feed'] && data['feed']['entry']) {
    var feedItems = data['feed']['entry'];
    for (var i = 0; i < feedItems.length; ++i) {
      var feedItem = feedItems[i];
      var itemId = feedItem['id'] && feedItem['id']['$t'];
      if (!this.feedMap_[itemId] && !localStorage['rm-' + itemId]) {
        this.feedItems_.push(feedItem);
        this.feedMap_[itemId] = {
          'item': feedItem,
          'removed': false
        };
        if (this.shouldShowFeedItem_(feedItem, this.options_)) {
          ++this.numNewItems_;
        }
      }
    }
    this.sortItems_();
    this.setBadgeText_();
  }
};


/**
 * Sets the proper icon based on the state of the system.
 */
YouTube.prototype.setIcon_ = function() {
  if (this.oauth_.hasToken()) {
    chrome.browserAction.setIcon({ 'path' : 'img/icon-on.png'});
    } else {
    chrome.browserAction.setIcon({ 'path' : 'img/icon-off.png'});
  }
};


/**
 * Sets the proper badge text based on the state of the system.
 */
YouTube.prototype.setBadgeText_ = function() {
  if (this.oauth_.hasToken()) {
    var count = this.numNewItems_;
    if (!this.countNewVideosOnly_()) {
      // Count everything we have. Old-style.
      count = 0;
      for (var i = 0; i < this.feedItems_.length; ++i) {
        if (this.shouldShowFeedItem_(this.feedItems_[i], this.options_)) {
          ++count;
        }
      }
      // No point in showing a count larger than the number of videos we show.
      count = Math.min(count, this.options_['numFeedItemsShown']);
    }
    var displayedCount = count || '';
    chrome.browserAction.setBadgeText({'text': '' + displayedCount});
  } else {
    chrome.browserAction.setBadgeText({'text': ''});
  }
};


YouTube.prototype.showNotification = function(user, title) {

	var notification = webkitNotifications.createNotification(
		'img/icon48.png',
		'New Event!',
		'Live "' + title + '" from "' + user + '"'
	);
	
	notification.show();
	
	setTimeout( function () {  
		notification.cancel(); 
	}, 10000);

}




/**
 * Opens the given url in a tab. Depending on user's preferences, it might reuse
 * the previously opened tab.
 * @param {string} url The url of the page.
 */
YouTube.prototype.openInTab = function(url) {
  if (this.videoTab_) {
    chrome.tabs.update(this.videoTab_.id, {'url': url, 'selected': true});
  } else {
    chrome.tabs.create({'url': url}, Util.bind(function(tab) {
      if (!this.options_['openInNewTab']) {
        // Save a reference and reuse the tab next time.
        this.videoTab_ = tab;
      }
    }, this));
  }
};


/**
 * Fired when a tab is closed.
 * @param {number} tabId The id of the tab that was closed.
 */
YouTube.prototype.onTabRemoved_ = function(tabId) {
  if (this.videoTab_ && this.videoTab_.id == tabId) {
    this.videoTab_ = null;
  }
};


/**
 * Sorts the items by creation time.
 */
YouTube.prototype.sortItems_ = function() {
  this.feedItems_.sort(this.sortFunction_);
};


/**
 * Sorting method for feed items.
 * @param {Object} a One feed item.
 * @param {Object} b Another feed item.
 */
YouTube.prototype.sortFunction_ = function(a, b) {
  var dateA = new Date(a['updated']['$t']);
  var dateB = new Date(b['updated']['$t']);
  return dateB.getTime() - dateA.getTime();
};


/**
 * @param {Object} feedItem A feed item.
 * @param {Object} prefs The user's preferences.
 * @return {boolean} Whether an item should be shown, based on user's
 *     preferences.
 */
YouTube.prototype.shouldShowFeedItem_ = function(feedItem, prefs) {
  var eventType = this.getEventType_(feedItem);
  if (YouTube.SUPPORTED_EVENT_TYPES.indexOf(eventType) == -1) {
    return false;
  }
  return prefs[eventType];
};


/**
 * @param {Object} feedItem A feed item.
 * @return {string} Returns the event type of the feed item.
 */
YouTube.prototype.getEventType_ = function(feedItem) {
  var categories = feedItem['category'];
  for (var i = 0; i < categories.length; ++i) {
    if (categories[i]['scheme'] == YouTube.EVENT_KIND_SCHEME || categories[i]['term'] == YouTube.LIVE_EVENT_SCHEME) {
      return categories[i]['term'];
    }/* else{
		console.log( "Event type not alowed", categories[i]['term'], YouTube.EVENT_KIND_SCHEME);
	} */
  }
  return null;
};


/**
 * Copied from Closure base.js.
 * @param {Function} fn The function to be bound.
 * @param {Object} selfObj The object to which *this* will point when fn will be
 *     executed.
 * @param {*} var_args Additional arguments that are partially applied to the
 *     function.
 */
Util = function() {};
Util.bind = function(fn, selfObj, var_args) {
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Returns the first element with a given class.
 * @param {string} cssClass The css class of the element we are looking for.
 * @return {Element} The first element with that class.
 */
Util.getFirstElementByClass = function(parent, cssClass) {
  var els = parent && parent.getElementsByClassName(cssClass);
  return els && els[0];
};


/**
 * Sets the html of the first child node with a specific css class.
 * @param {Element} parent The element which contains the child.
 * @param {string} childCssClass The css class of the child.
 * @param {string} html The html for the child.
 */
Util.setChildHTML = function(parent, childCssClass, html) {
  var el = Util.getFirstElementByClass(parent, childCssClass);
  if (el) {
    el.innerHTML = html;
  }
};


/**
 * Sets the source of a child img tag with a given class name.
 * @param {Element} parent The element which contains the child.
 * @param {string} childCssClass The css class of the child.
 * @param {string} imageSrc The image source.
 */
Util.setImageSrc = function(parent, childCssClass, imageSrc) {
  var el = Util.getFirstElementByClass(parent, childCssClass);
  if (el) {
    el.src = imageSrc;
  }
};


/**
 * Sets the href of an child anchor with a given class name.
 * @param {Element} parent The element which contains the child.
 * @param {string} childCssClass The css class of the child.
 * @param {string} imageSrc The image source.
 */
Util.setAnchorHref = function(parent, childCssClass, href) {
  var el = Util.getFirstElementByClass(parent, childCssClass);
  if (el) {
    el.href = href;
  }
};


/**
 * Sets the name for an element.
 * @param {Element} parent The element which contains the child.
 * @param {string} childCssClass The css class of the child.
 * @param {string} name The name for the element.
 */
Util.setName = function(parent, childCssClass, name) {
  var el = Util.getFirstElementByClass(parent, childCssClass);
  if (el) {
    el.name = name;
  }
};


/**
 * Sets the CSS class for an element.
 * @param {Element} element The element whose css class is set.
 * @param {string} cssClassName The css class for the element.
 */
Util.setCssClass = function(element, cssClassName) {
  element.className = cssClassName;
};


/**
 * Formats the video length. Removes anything lower than seconds. Removes
 * leading zeros.
 * @param {string} videoTime The video length as reported by gdata.
 * @return {string} Formatted video length.
 */
Util.formatVideoLength = function(videoLength) {
  if (!videoLength) {
    return '';
  }
  var result = '';
  var hours = Math.floor(videoLength / 3600);
  var secondsLeft = videoLength - hours * 3600;
  var minutes = Math.floor(secondsLeft / 60);
  var seconds = secondsLeft - minutes * 60;

  if (hours && hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  if (hours) {
    result = [hours, minutes, seconds].join(':');
  } else {
    result = [minutes, seconds].join(':');
  }

  return result;
};


/**
 * Formats the view count. Adds commas for every thousand.
 * @param {string} viewCount The view count as reported by gdata.
 * @return {string} Formatted view count.
 */
Util.formatViewCount = function(viewCount) {
  if (!viewCount) {
    return '';
  }
  var counter = 0;
  var result = [];
  var len = viewCount.length;
  for (var i = 0; i < len; ++i, ++counter) {
    if (counter == 3) {
      result.push(',');
      counter = 0;
    }
    result.push(viewCount[len - i - 1]);
  }
  return result.reverse().join('');
};


/**
 * Formats a timestamp using numbers and words.
 * @param {string} timeString The timestamp as reported by gdata as a string.
 * @return {string} Formatted timestamp.
 */
Util.formatTimeSince = function(timeString) {
  if (!timeString) {
    return '';
  }
  var timeStringDate = new Date(timeString);
  var currentDate = new Date();
  var timeDiffSeconds = (currentDate.getTime() -
                         timeStringDate.getTime()) / 1000;
  var minutesAgo =  Math.floor(timeDiffSeconds / 60);
  var secondsAgo = timeDiffSeconds - minutesAgo * 60;
  var hoursAgo = Math.floor(minutesAgo / 60);
  var daysAgo = Math.floor(hoursAgo / 24);
  var weeksAgo = Math.floor(daysAgo / 7);
  var monthsAgo = Math.floor(daysAgo / 30);
  var yearsAgo = Math.floor(monthsAgo / 12);
  var amount = 0;
  var messageSingular = '';
  var messagePlural = '';
  var result = '';

  if (yearsAgo) {
    amount = yearsAgo;
    messageSingular = chrome.i18n.getMessage('yearAgo');
    messagePlural = chrome.i18n.getMessage('yearsAgo', [amount]);
  } else if (monthsAgo) {
    amount = monthsAgo;
    messageSingular = chrome.i18n.getMessage('monthAgo');
    messagePlural = chrome.i18n.getMessage('monthsAgo', [amount]);
  } else if (weeksAgo) {
    amount = weeksAgo;
    messageSingular = chrome.i18n.getMessage('weekAgo');
    messagePlural = chrome.i18n.getMessage('weeksAgo', [amount]);
  } else if (daysAgo) {
    amount = daysAgo;
    messageSingular = chrome.i18n.getMessage('dayAgo');
    messagePlural = chrome.i18n.getMessage('daysAgo', [amount]);
  } else if (hoursAgo) {
    amount = hoursAgo;
    messageSingular = chrome.i18n.getMessage('hourAgo');
    messagePlural = chrome.i18n.getMessage('hoursAgo', [amount]);
  } else if (minutesAgo) {
    amount = minutesAgo;
    messageSingular = chrome.i18n.getMessage('minuteAgo');
    messagePlural = chrome.i18n.getMessage('minutesAgo', [amount]);
  } else if (secondsAgo) {
    amount = secondsAgo;
    messageSingular = chrome.i18n.getMessage('secondAgo');
    messagePlural = chrome.i18n.getMessage('secondsAgo', [amount]);
  } else {
    amount = 1;
    messageSingular = chrome.i18n.getMessage('secondAgo');
    messagePlural = chrome.i18n.getMessage('secondsAgo', [amount]);
  }

  if (amount > 1) {
    result = messagePlural;
  } else {
    result = messageSingular;
  }
  return result;
};


/**
 * Builds a video watch url given a video id.
 * @param {string} videoId The id of the video.
 * @return {string} The watch url for the video.
 */
Util.videoWatchUrl = function(videoId) {
  return YouTube.WATCH_VIDEO_PREFIX_URL + videoId + '&feature=' +
         YouTube.FEATURE_YOUTUBE_FEED_CHROME_EXTENSION;
};


/**
 * Builds a channel url given a username.
 * @param {string} username The username for the channel.
 * @return {string} The channel url for that user's channel.
 */
Util.channelUrl = function(username) {
  return YouTube.CHANNEL_PREFIX_URL + username + '?feature=' +
         YouTube.FEATURE_YOUTUBE_FEED_CHROME_EXTENSION;
};


/**
 * Builds a thumbnail url given a video.
 * @param {string} videoId The id of the video.
 * @return {string} The thumbnail url for the video.
 */
Util.thumbnailUrl = function(videoId) {
  return YouTube.VIDEO_THUMBNAIL_PREFIX_URL + videoId + '/default.jpg';
};
