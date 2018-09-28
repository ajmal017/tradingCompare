
// (function(window) {
var stockApp = angular.module('stockApp', []).config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');})


// var demo = angular.module('LiveFeedsApp', []).config(function ($interpolateProvider) {
//     $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
// });

stockApp.controller("stockController", function ($scope, $http) {

    $scope.all = []
    $scope.all1 = []
    $scope.allimg = {}
    $scope.allimg1 = []
    $scope.alllikes = {}
    $scope.element={}

    var i = 0
    $scope.init = function (api,chart_link,likes) {
        console.log("api", api, "chart_link", chart_link)

        $.ajax({
            url: api,
            type: "GET",
            success: function (result) {

                $scope.all1 = result
                console.log("$scope.all1",$scope.all1)
                for (key in $scope.all1) {
                    if (i < 50) {
                        $scope.all.push($scope.all1[key])
                        i++
                    }
                    else break;
                }
                //console.log("Response-stock", $scope.all)

                $scope.$apply()
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log("ERROR", thrownError, xhr, ajaxOptions)
            }
        });

// var allimg={}

        //     console.log("img", img)
        //
        //     $.ajax({
        //         url: img,
        //         type: "GET",
        //         success: function (result) {
        //             $scope.allimg1 = result
        //             for (var i = 0; i < $scope.allimg1.length; i++) {
        //                 $scope.allimg[$scope.allimg1[i].symbol] = {img: $scope.allimg1[i].img}
        //                 //console.log("imaaaage",$scope.allimg[$scope.allimg1[i].symbol].img)
        //             }
        //             // for (const key in myobj) {
        //             //     if (myobj.hasOwnProperty(key)) {
        //             //         const element = myobj[key];
        //             //         $scope.allimg.push(element)
        //             //     }}
        //             //  console.log("Response------", myobj)
        //
        //             $scope.$apply()
        //         },
        //         error: function (xhr, ajaxOptions, thrownError) {
        //             console.log("ERROR", thrownError, xhr, ajaxOptions)
        //         }
        //
        //     });
        //
        // }


////////////////////////////////////////////////////////////////////
        console.log("likes", likes)
        $.ajax({
            url: likes,
            type: "GET",
            success: function (result) {
                $scope.alllikes = result
                for (const key in $scope.alllikes) {
                    $scope.element[$scope.alllikes[key].symbol] = $scope.alllikes[key]
                    var sent = ($scope.element[$scope.alllikes[key].symbol].likes / ($scope.element[$scope.alllikes[key].symbol].likes + $scope.element[$scope.alllikes[key].symbol].unlikes)) * 100
                    // console.log("Response*likes*", sent)
                    $scope.element[$scope.alllikes[key].symbol].sentiment = Number(sent.toFixed(1))

                }

                $scope.allimg = $scope.element
                console.log("Response*likes*", $scope.allimg)

                $scope.$apply()


            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("ERROR", thrownError, xhr, ajaxOptions)
            }
        })
    }

        var socket = io.connect("https://websocket-stock.herokuapp.com")

        socket.on('connect', function () {
        socket.emit('room', "persec");
        socket.on('message', data => {
            //console.log("STOCK RESP", data)
            for (const key in data) {
                var item73 = $scope.all.find(function (element) {

                    return (element.name == data[key].name);

                })
                if (typeof item73 != typeof undefined) {
                    for (const ky in data[key]) {
                        if (data.hasOwnProperty(key)) {
                            item73[ky] = data[key][ky];

                        }
                    }

                }
                $scope.$apply()
            }
            //
        })
    })


    $scope.ActiveChange = function (symbol) {


        var url =  Routing.generate('stock_chart',{"currency" :symbol})
        console.log(Routing.generate('stock_chart',{"currency" :symbol}))
        window.location.href= url
        //  console.log("----", Routing.generate('crypto_chart', from, to, true))
        return url
        // console.log("----",Routing.generate('crypto_chart'))

    }

});

var dvstock = document.getElementById('dvstock');

angular.element(document).ready(function() {

    angular.bootstrap(dvstock, ['stockApp']);
});
//
// })(window);


