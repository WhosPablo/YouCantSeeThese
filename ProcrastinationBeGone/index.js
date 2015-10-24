Parse.initialize("RLrGIdVcBOjo80GwB5fi3xi3lCZ0Qk2RpO9fXiGr", "Lmu4rEdndfn1ihx2vDNIISC9O1MrI9FRarzJGul3");

var currUser = Parse.User.current();
main();


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





