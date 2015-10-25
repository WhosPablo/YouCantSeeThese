Parse.initialize("RLrGIdVcBOjo80GwB5fi3xi3lCZ0Qk2RpO9fXiGr", "Lmu4rEdndfn1ihx2vDNIISC9O1MrI9FRarzJGul3");

var currUser = Parse.User.current();
main();


function main() {
    var username = currUser.get('username');
    var topTenQuery;
    var blockedSitesQuery;
    var blockedSites;
    var topTenNotBlocked;

    function clear() {
        var query = new Parse.Query(Site);
        query.equalTo("user", username);
        query.find({
            success: function (results) {
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    object.destroy();
                }

            },
            error: function (error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    }


    function findTopTenSitesNotBlocked() {

        var Site = Parse.Object.extend("Site");
        topTenQuery = new Parse.Query(Site);
        topTenQuery.equalTo('user', username);
        topTenQuery.doesNotMatchKeyInQuery('hostname', 'hostname', blockedSitesQuery);
        topTenQuery.descending("timeSpent");

        topTenQuery.find({
            success: function (results) {
                var data = [];
                topTenNotBlocked = {};
                for (var i = 0; i < results.length; i++) {

                    var object = results[i];
                    topTenNotBlocked[object.id] = object;
                    console.log(object.id + ' - ' + object.get('hostname'), object.get("timeSpent"));

                    var minDiff = object.get("timeSpent");
                    minDiff = Math.round(minDiff / 600) / 100;
                    data.push([object.get("title"), minDiff]);

                    addSiteToList(object, false);
                }
                drawChart(data);
                addListeners();


            },
            error: function (error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    }

    function findBlockedSites() {


        var BlockedSite = Parse.Object.extend("BlockedSite");
        blockedSitesQuery = new Parse.Query(BlockedSite);
        blockedSitesQuery.equalTo('user', username);
        blockedSitesQuery.find({
            success: function (results) {
                $('#siteGroup').empty();
                blockedSites = {};

                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    blockedSites[object.id] = object;
                    console.log("blocked site" + object.id + ' - ' + object.get('hostname'));
                    addSiteToList(object, true);
                }

                findTopTenSitesNotBlocked();
            },
            error: function (error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    }

    function addSiteToList(object, blocked) {
        var checked = "";
        if (blocked){
            checked = "checked";
        }

        $('#siteGroup').append(
            "<li class='list-group-item clearfix' style='background:#2980b9; color:#FFFFFF'>" +
            "<b>" + object.get("title") + "</b>" +
                "<span class='pull-right'>" +
                "<div class='onoffswitch'>" +
                "<input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' "+ checked+
                " id= " + object.id +">" +
                "<label class='onoffswitch-label' for=" +
                object.id + ">" +
                "<span class='onoffswitch-inner'></span>" +
                "<span class='onoffswitch-switch'></span>" +
                "</label>" +
                "</div>" +
                "</span>" +
                "</li>"
            );


    }




    function drawChart(data) {

        $('#highchartsContainer').highcharts({
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            chart: {
                style: {
                    color: '#FFFFFF'
                },
                type: 'column',
                animation: {
                    duration: 10

                },
                backgroundColor: 'transparent'
            },
            title: {
                style: {
                    color: '#FFFFFF',
                    fontSize: '26px'
                },
                text: 'Time Spent on Sites'
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif',
                        color: '#FFFFFF'
                    }
                }
            },
            yAxis: {
                labels: {
                    style: {
                        color: '#FFFFFF'
                    }
                },
                min: 0,
                title: {
                    text: 'Time (minutes)',
                    style: {
                        color: '#FFFFFF'
                    }
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
                    color: '#FFFFFF',
                    align: 'right',
                    format: '{point.y:.11f}', // two decimals
                    y: 0, // 10 pixels down from the top
                    x: -5,
                    style: {
                        fontSize: '13px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                },
                color: '#c0392b'
            }]
        });
    }

    function addListeners(){
        $("input[type='checkbox']").click(function() {
            var BlockedSite = Parse.Object.extend("BlockedSite");
            if(this.checked){
                var siteObject = topTenNotBlocked[this.id];
                if(siteObject){
                    query = new Parse.Query(BlockedSite);
                    query.equalTo('user', username);
                    query.equalTo('hostname', siteObject.get("hostname"));
                    query.first({
                        success: function (result) {
                            if(!result){
                                var site1 = new BlockedSite();
                                site1.save({
                                    user: siteObject.get('user'),
                                    hostname: siteObject.get('hostname'),
                                    title: siteObject.get('title')
                                }).then(function (object) {
                                    console.log("yay! it blocked",siteObject.get('hostname'));
                                    delete topTenNotBlocked[siteObject.id];
                                    blockedSites[siteObject.id]= siteObject;
                                    //findBlockedSites();

                                });
                            }
                            delete blockedSites[siteObject.id];
                        },
                        error: function (error) {
                            console.log("Error: " + error.code + " " + error.message);
                        }
                    });
                }
            } else {
                var siteObject = blockedSites[this.id];
                if(siteObject){
                    query = new Parse.Query(BlockedSite);
                    query.equalTo('user', username);
                    query.equalTo('hostname', siteObject.get("hostname"));
                    query.find({
                        success: function (results) {
                            for (var i = 0; i < results.length; i++) {

                                var object = results[i];
                                object.destroy().then( function (object){
                                        //findBlockedSites();
                                        console.log("deleting"+ object.id+ object.get("hostname"));
                                        delete blockedSites[siteObject.id];
                                        topTenNotBlocked[siteObject.id]= siteObject;
                                    }
                                );


                            }

                        },
                        error: function (error) {
                            console.log("Error: " + error.code + " " + error.message);
                        }
                    });

                }
            }

        });
    }

    window.addEventListener('focus', function () {
        findBlockedSites();
    });
    findBlockedSites();
}




