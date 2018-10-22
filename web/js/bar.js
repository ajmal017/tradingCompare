var firstApp = angular.module('firstApp', []).config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');})

firstApp.controller('FirstController', function($scope) {
    $scope.desc1 = "First app. ";

    $scope.allforex = []
    $scope.barstock = []
    $scope.allstock2 = []
    $scope.last_price = {}

    $scope.cryptoname1
    $scope.cryptoname2

    $scope.init = function(api_forex, api_crypto, api_stock, crypto_from1, crypto_from2, crypto_to1 ,crypto_to2,
                           forex_from1, forex_to1, forex_from2, forex_to2, stock1,stock2) {

        $.ajax({
            url: api_crypto + "/" + crypto_from1 +"_"+ crypto_to1 + "," + crypto_from2 +"_"+ crypto_to2,
            type: "GET",
            success: function (result) {
                //console.log("barcrypto", result)
                $scope.crypto3 = result[crypto_from1+"_"+crypto_to1 ]
                $scope.crypto4 = result[crypto_from2+"_"+crypto_to2 ]
                $scope.cryptoname1 = $scope.crypto3.name
                $scope.cryptoname2 = $scope.crypto4.name

                $scope.$apply()
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("ERROR", thrownError, xhr, ajaxOptions)
            }
        });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $.ajax({
            url: api_forex,
            type: "GET",

            success: function (result) {
                //console.log("Response-forex", result)
                for (var key in result) {$scope.allforex.push(result[key])}
                for (key in $scope.allforex) {
                    if($scope.allforex[key].fromSymbol == "EURUSD") { $scope.crypto1 = $scope.allforex[key]}
                    if($scope.allforex[key].fromSymbol == "USDJPY") {$scope.crypto2 = $scope.allforex[key]}
                }
                $scope.$apply()
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("ERROR", thrownError, xhr, ajaxOptions)
            }
        });

    ///////////////////////////////////////////////////////////////////////////////////////////
        $.ajax({
            url: "https://websocket-stock.herokuapp.com/Getstocks/" + stock1 + "," + stock2,
            type: "GET",
            success: function (result) {
                $scope.barstock = result
                console.log("$scope.barstock", $scope.barstock)
                $scope.crypto5 = $scope.barstock[stock1]
                $scope.crypto6 = $scope.barstock[stock2]

                $scope.$apply()
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("ERROR", thrownError, xhr, ajaxOptions)
            }
        });

/////****************************SOCKETS*********************************/////
        //CRYPTO
        var socket1 = io.connect("https://crypto.tradingcompare.com/")
        socket1.on('connect', function () {
            var crypto1 = crypto_from1 + "_" + crypto_to1
            var crypto2 = crypto_from2 + "_" + crypto_to2

            socket1.emit('room', [crypto1, crypto2]);
            socket1.on('message', data => {
                //console.log("data socket", data)
              if (data.hasOwnProperty('pair')) {
                  if (data.pair == $scope.crypto3.pair) {
                      $scope.crypto3 = data;
                      $scope.crypto3.fromSymbol = crypto_from1
                      $scope.crypto3.toSymbol = "USD"
                      $scope.crypto3.name = $scope.cryptoname1

                  }

                  if (data.pair == $scope.crypto4.pair) {
                      $scope.crypto4 = data;
                      $scope.crypto4.fromSymbol = crypto_from2
                      $scope.crypto4.toSymbol = "USD"
                      $scope.crypto4.name = $scope.cryptoname2
                  }
              }
              else {console.log("data bar else", data)}
              $scope.$apply()
            })
        })

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //FOREX
        var socket2 = io.connect("https://forex-websocket.herokuapp.com/", {
            path: "/socket/forex/livefeed"}, {'force new connection': true})
        socket2.on('connect', function() {

            socket2.emit('room', ["EURUSD_1sec","USDJPY_1sec"]);
            socket2.on("message", function (response) {


                var item73 = $scope.allforex.find(function (element) {
                        return element.pair == response.pair;
                });

                if (typeof item73 != typeof undefined) {
                    for (const key in response) {
                        if (response.hasOwnProperty(key)) {
                            item73[key] = response[key];
                            $scope.$apply()
                        }
                    }
                }

            })
            $scope.$apply()
        })
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        //STOCK
        var socketStock = io.connect("https://ws-api.iextrading.com/1.0/last");
        var str = stock1 + "," +stock2
        //console.log("str",str)
        socketStock.emit("subscribe", str);

        socketStock.on("message", (data) => {
            data = JSON.parse(data);
            //console.log("data", data,)

            if( ($scope.crypto5 == undefined && typeof $scope.crypto5 == "undefined") && data.symbol == stock1 ) {
                console.log("1")
                    $scope.crypto5 = data
                    $scope.crypto5.name = "Facebook"
                    $scope.crypto5.price = data.price
                    $scope.barstock[stock1] = data
                    $scope.barstock[stock1].open24 = data.price
                    $scope.crypto5.change24 = 0
                    $scope.crypto5.point = 0
                    $scope.last_price[stock1] = data.price

            }
            else if( ($scope.crypto6 == undefined && typeof $scope.crypto6 == "undefined") && data.symbol == stock2) {
                console.log("2")
                    $scope.crypto6 = data
                    $scope.crypto6.name = "Apple"
                    $scope.crypto6.price = data.price
                    $scope.barstock[stock2] = data
                    $scope.barstock[stock2].open24 = data.price
                    $scope.crypto6.change24 = 0
                    $scope.crypto6.point = 0
                    $scope.last_price[stock2] = data.price
            }
            else {
                if (data.symbol == stock1) {
                    console.log("3")
                    $scope.crypto5.price = data.price

                    if(data.price >= $scope.last_price[stock1])
                        $scope.crypto5.variation = "up"
                    else
                        $scope.crypto5.variation = "down"

                    $scope.crypto5.change24 = (((data.price - $scope.barstock[stock1].open24) / $scope.barstock[stock1].open24) * 100).toFixed(2)
                    $scope.crypto5.point = ($scope.barstock[stock1].open24 - data.price).toFixed(2)

                    $scope.last_price[stock1] = data.price
                }
                if (data.symbol == stock2) {
                    console.log("4")
                    $scope.crypto6.price = data.price

                    if(data.price >= $scope.last_price[stock2])
                        $scope.crypto6.variation = "up"
                    else
                        $scope.crypto6.variation = "down"

                    $scope.crypto6.change24 = (((data.price - $scope.barstock[stock2].open24) / $scope.barstock[stock2].open24) * 100).toFixed(2)
                    $scope.crypto6.point = ($scope.barstock[stock2].open24 - data.price).toFixed(2)
                    $scope.last_price[stock2] = data.price
                    //console.log("$scope.crypto6", $scope.crypto6)
                }
                //console.log("$scope.crypto6", $scope.crypto6)
            }
            $scope.$apply()

        })

    }

/////**************************** CLICKS FUNCTIONS *********************************/////

    // CRYPTO
    $scope.GotoCrypto = function (symbol, name) {
        //console.log("symbol666", symbol, name)

        if(name.indexOf(' ') > -1)
            name = name.replace(/ /g, '-')

        var url =  Routing.generate('crypto_chart',{"currency" :symbol, "name" :name})
        //console.log(Routing.generate('crypto_chart',{"currency" :symbol, "name" :name}))
        window.location.href= url
        return url

    }
    // FOREX
    $scope.GotoStock = function (symbol, name) {

        if(name.indexOf(' ') > -1)
            name = name.replace(/ /g, '-')

        var url =  Routing.generate('stock_chart',{"symbol" :symbol, "name":name })
        console.log(Routing.generate('stock_chart',{"symbol" :symbol, "name":name }))
        window.location.href= url
        return url
    }
    //STOCK
    $scope.GotoForex = function (symbol) {

        var from = symbol.slice(0, 3)
        var to = symbol.slice(3, 6)
        symbol = from + "-" + to

        var url =  Routing.generate('forex_chart',{"currency" :symbol})
        console.log(Routing.generate('forex_chart',{"currency" :symbol}))
        window.location.href= url

    }
});


var dvFirst = document.getElementById('dvFirst');

angular.element(document).ready(function() {

    angular.bootstrap(dvFirst, ['firstApp']);

});

