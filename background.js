chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var page = $.ajax({url: "https://old.reddit.com" + request.permalink, async: false})
    sendResponse({response: page.responseText});
  }
);
