var prefs = {};
var parser = document.createElement('a');
var lastUrl = null;
var lastTime = null;

Parse.initialize("Xcat16hMq0jy4bEDtdzRQcDauxwTiu6Y7mN2s8By", "gtfBeoPKCkCGzbspbmfCVxrJ2dQjh7FQhxGZRI3c");

chrome.browserAction.onClicked.addListener(function(activeTab){
    var newWindow = window.open("index.html");
});

chrome.storage.local.get({callback: 'http://localhost:8080', key: 'chrome'}, function(o) { prefs = o; });

chrome.storage.onChanged.addListener(function(changes) {
    for (key in changes) {
        prefs[key] = changes[key].newValue;
    }
});

function log(url, title){
    if(lastUrl !== url){
        updateUrl(url, title)
    }


}

function updateUrl(url, title){
    parser.href = url;

    var Site = Parse.Object.extend("Site");

    var query = new Parse.Query(Site);

    query.equalTo("url",parser.hostname );

    query.first({
        success: function(object) {
            if(object) {
                console.log("Successfully retrieved " + object);
                var minDiff = Date.now() - lastTime;
                //minDiff = Math.round(((minDiff % 86400000) % 3600000) / 60000);

                console.log(minDiff+object.get("time"), object.get("time"))
                object.set("time", minDiff+object.get("time"));
                object.save();
            } else {
                var site1 = new Site();
                site1.save({
                    url: parser.hostname, time: 0,
                    title: title
                }).then(function(object) {
                    console.log("yay! it worked", url, parser.hostname);
                });
            }

        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });

    lastUrl = url;
    lastTime = Date.now();
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.status === "complete" && tab.active) {
            chrome.windows.get(tab.windowId, {populate: false}, function(window) {
                if (window.focused) {
                    log(tab.url, tab.title || null);
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        chrome.windows.get(tab.windowId, {populate: false}, function(window) {
            if (window.focused) {
                log(tab.url, tab.title || null);
            }
        });
    }
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        log(null, null, null);
    } else {
        chrome.windows.get(windowId, {populate: true}, function(window) {
            if (window.focused) {
                chrome.tabs.query({active: true, windowId: windowId}, function (tabs) {
                    if (tabs[0].status === "complete") {
                        log(tabs[0].url, tabs[0].title || null);
                    }
                });
            }
        });
    }
});