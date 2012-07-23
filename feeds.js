function initialize() {
	var youtube = chrome.extension.getBackgroundPage().youtube;
	var loginButton = document.getElementById('login_button');
	loginButton.addEventListener('mousedown', function () {
		youtube.login();
	});
	var logoutButton = document.getElementById('logout_button');
	logoutButton.addEventListener('mousedown', function() {
		youtube.logout();
		window.close();
	});

	var titleText = chrome.i18n.getMessage('titleFeedPage');
	var h1Title = document.getElementById('title');
	h1Title.innerHTML = titleText;
	document.title = titleText;

	if (youtube.isLoggedIn()) {
		logoutButton.innerHTML = chrome.i18n.getMessage('buttonLogout');
		logoutButton.style.display = '';

		var feedDom = document.getElementById('feed');
		var feedEntryTemplate = document.getElementsByClassName('feed-entry-template')[0];
		feedDom.innerHTML = youtube.buildFeedDom(feedEntryTemplate).innerHTML;
		var feedEntryUsers = document.getElementsByClassName('feed-entry-user');
		var videoAuthors = document.getElementsByClassName('feed-entry-video-from-username');
		var videos = document.getElementsByClassName('feed-entry-video-thumb');
		var videoTitles = document.getElementsByClassName('feed-entry-video-long-title-anchor');
		var removeIcons = document.getElementsByClassName('feed-entry-remove');

		for (var i = 0; i < feedEntryUsers.length; ++i) {
			feedEntryUsers[i].addEventListener('mousedown', function(e) {
				youtube.openInTab(e.currentTarget.href);
			});
		}

		for (var i = 0; i < videoAuthors.length; ++i) {
			videoAuthors[i].addEventListener('mousedown', function(e) {
				youtube.openInTab(e.currentTarget.href);
			});
		}
		for (var i = 0; i < videos.length; ++i) {
			videos[i].addEventListener('mousedown', function(e) {
				youtube.openInTab(e.currentTarget.href);
			});
		}
		for (var i = 0; i < videoTitles.length; ++i) {
			videoTitles[i].addEventListener('mousedown', function(e) {
				youtube.openInTab(e.currentTarget.href);
			});
		}
		for (var i = 0; i < removeIcons.length; ++i) {
			removeIcons[i].addEventListener('mousedown', function(e) {
				var entry = e.currentTarget.parentNode;
				var itemId = Util.getFirstElementByClass(entry, 'feed-entry-item-id');
				youtube.removeFeedEntry(itemId.name);
				entry.parentNode.removeChild(entry);
			});
		}
	} else {
		loginButton.innerHTML = chrome.i18n.getMessage('buttonLogin');
		loginButton.style.display = '';

		var feedDom = document.getElementById('feed');
		var needLoginH2 = document.createElement('h2');
		needLoginH2.className = 'needLogin';
		needLoginH2.innerHTML = chrome.i18n.getMessage('messageNeedLogin');
		var needLoginDiv = document.createElement('div');
		needLoginDiv.appendChild(needLoginH2);
		feedDom.innerHTML = needLoginDiv.innerHTML;
	}
	youtube.resetNumNewItems();
}
	
document.addEventListener('DOMContentLoaded', function () {
	initialize();
});