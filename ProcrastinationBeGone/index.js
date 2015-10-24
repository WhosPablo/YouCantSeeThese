Parse.initialize("Xcat16hMq0jy4bEDtdzRQcDauxwTiu6Y7mN2s8By", "gtfBeoPKCkCGzbspbmfCVxrJ2dQjh7FQhxGZRI3c");

var currUser = Parse.User.current()
if (currUser) {
    main();
} else {
    chrome.storage.sync.get(['userId', 'userPass'], function (result) {
        if (result.userId) {
            logIn(result.userId, result.userPass);
        } else {
            var userId = getRandomToken();
            var userPass = getRandomToken();
            chrome.storage.sync.set({userId: userId, userPass: userPass}, function () {
                signUp(userId, userPass);
            });
        }

        function logIn(userId, userPass) {
            Parse.User.logIn(userId, userPass, {
                success: function (user) {
                    console.log("Log In Success");
                    currUser = Parse.User.current();
                    main();
                },
                error: function (pUser, error) {
                    // The login failed. Check error to see why.
                    console.log("Log In Error: " + error.code + " " + error.message);
                }
            });
        }

        function signUp(userId, userPass) {

            var parseUser = new Parse.User();
            parseUser.set("username", userId);
            parseUser.set("password", userPass);
            parseUser.signUp(null, {
                success: function (user) {
                    console.log("Sign Up Success");
                    currUser = Parse.User.current();
                    main();
                },
                error: function (pUser, error) {
                    // Show the error message somewhere and let the user try again.
                    console.log("Sign Up Error: " + error.code + " " + error.message);
                }
            });
        }
    });
}


function main() {

    var username = currUser.get('username');

    function loadChart() {

        var data = [];

        var Site = Parse.Object.extend("Site");
        var query = new Parse.Query(Site);
        query.equalTo('user', username);
        query.descending("timeSpent");
        query.limit(10);

        query.find({
            success: function (results) {
                //alert("Successfully retrieved " + results.length + " scores.");
                // Do something with the returned Parse.Object values
                for (var i = 0; i < results.length; i++) {

                    var object = results[i];
                    var minDiff = object.get("timeSpent");
                    minDiff = Math.round(minDiff / 600) / 100;
                    data.push([object.get("title"), minDiff]);
                    console.log(object.id + ' - ' + object.get('url'), object.get("timeSpent"));
                }
                drawChart(data);

            },
            error: function (error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    }

    function drawChart(data) {
        $('#container').highcharts({
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            chart: {
                type: 'column',
                animation: {
                    duration: 500
                }
            },
            title: {
                text: 'Time Spent on Sites'
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Time (minutes)'
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: 'Time spent: <b>{point.y:.1f} minutes</b>'
            },
            series: [{
                name: 'Time',
                data: data,
                dataLabels: {
                    enabled: true,
                    rotation: 0,
                    color: '#000000',
                    align: 'right',
                    format: '{point.y:.1f}', // one decimal
                    y: 0, // 10 pixels down from the top
                    x: -5,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            }]
        });
    }

    window.addEventListener('focus', function () {
        loadChart();
    });
}





