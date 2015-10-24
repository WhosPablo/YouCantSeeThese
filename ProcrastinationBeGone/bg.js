var user = {};
var parser = document.createElement('a');
var lastUrl = null;
var lastTime = null;

Parse.initialize("Xcat16hMq0jy4bEDtdzRQcDauxwTiu6Y7mN2s8By", "gtfBeoPKCkCGzbspbmfCVxrJ2dQjh7FQhxGZRI3c");

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

chrome.browserAction.onClicked.addListener(function(activeTab){
    window.open("index.html");
});

//chrome.storage.sync.get(['userId', 'userPass'], function(o) {
//    user = o;
//    if(user.userId){
//        logIn(user.userId,user.userPass);
//    } else {
//        var userId = getRandomToken();
//        var userPass = getRandomToken();
//
//
//        chrome.storage.sync.set({userId: userId, userPass:userPass}, function() {
//            signUp(userId, userPass);
//        });
//    }
//
//    function logIn(userId, userPass) {
//        Parse.User.logIn(userId, userPass, {
//            success: function(user) {
//                console.log("Log In Success");
//            },
//            error: function(pUser, error) {
//                // The login failed. Check error to see why.
//                console.log("Log In Error: " + error.code + " " + error.message);
//            }
//        });
//    }
//
//    function signUp(userId, userPass) {
//
//        var parseUser = new Parse.User();
//        parseUser.set("username", userId);
//        parseUser.set("password", userPass);
//        parseUser.signUp(null, {
//            success: function(user) {
//                console.log("Sign Up Success");
//            },
//            error: function(pUser, error) {
//                // Show the error message somewhere and let the user try again.
//                console.log("Sign Up Error: " + error.code + " " + error.message);
//            }
//        });
//    }
//});

chrome.storage.onChanged.addListener(function(changes) {

    user['userId'] = changes['userId'].newValue;
    user['userPass'] = changes['userPass'].newValue;
});

function log(url, title){
    parser.href = url;
    var hostname = parser.hostname;
    if(lastUrl !== url){
        updateUrl(hostname, title)
    }


}

function updateUrl(url, title){


    var Site = Parse.Object.extend("Site");

    var query = new Parse.Query(Site);

    query.equalTo("url",url );

    query.first({
        success: function(object) {
            if(object) {
                console.log("Successfully retrieved " + object);
                var minDiff = Date.now() - object.get("lastAccessed");
                //minDiff = Math.round(((minDiff % 86400000) % 3600000) / 60000);

                console.log(minDiff+object.get("timeSpent"), object.get("timeSpent"));
                object.set("timeSpent", minDiff+object.get("timeSpent"));
                object.save();
                lastUrl = url;
                lastTime = Date.now();
            } else {
                var site1 = new Site();
                site1.save({
                    url: url,
                    timeSpent: 0,
                    lastAccessed: Date.now(),
                    title: title
                }).then(function(object) {
                    console.log("yay! it worked", url);
                });
            }

        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });


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
