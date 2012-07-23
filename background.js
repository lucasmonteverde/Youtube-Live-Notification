var oauth = ChromeExOAuth.initBackgroundPage({
	'request_url'     :  'https://www.google.com/accounts/OAuthGetRequestToken',
	'authorize_url'   :  'https://www.google.com/accounts/OAuthAuthorizeToken',
	'access_url'      :  'https://www.google.com/accounts/OAuthGetAccessToken',
	'consumer_key'    :  'anonymous',
	'consumer_secret' :  'anonymous',
	'scope'           :  'http://gdata.youtube.com',
	'app_name'        :  'YouTube Activity Chrome Extension'
});
var youtube = new YouTube(oauth);
youtube.initialize();
youtube.startPolling();