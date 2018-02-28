// NYSE live trading data webapp functionality
// M Allen: Freelance Web Developer - 2018

// Enable functionality when document has loaded
$(document).ready(function() {
  // Global variables
  var dataSourceLead = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NYSE:";
  var dataClosingLead = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=NYSE:";
  var dataSourceKey = "&interval=1min&apikey=CU189YWICQBL2XB0";
  var stockCodeList = ["BA", "ORCL", "GM", "XOM", "MA"];  // New York Stock Exchange stock codes
  var stockClosingPrice = {}; // Object to store stock code and closing price

  // Get closing price from last full day of trading
  function getClosingPrice(stockCode) {
    var dataSource = dataClosingLead + stockCode + dataSourceKey;
    $.ajax({
      url : dataSource,
      method : 'GET',
      dataType:'json',
      success : function (data) {
        // Read compact day series
        var dSeries = data["Time Series (Daily)"];
        var counter = 0;
        $.each(dSeries, function(key, value){
          if (counter > 0) { return } // End $.each when latest entry is stripped out
          stockClosingPrice[stockCode] = value["4. close"];
          counter++;
        });
      }
    });

  }
  // Get live JSON data from Alpha Vantage API based on stock code
  function getStockData(stockCode, count) {
    // Scope variables
    var avgPrice, volume, change, timeStamp
    // Define data source based on stockCode
    var dataSource = dataSourceLead + stockCode + dataSourceKey;
    $.ajax({
      url : dataSource,
      method : 'GET',
      dataType:'json',
      success : function (data) {
        // Extract the data we need
        var tSeries = data["Time Series (1min)"];
        var counter = 0;
        $.each(tSeries, function(key, value){
          if (counter > 0) { return } // End $.each when latest entry is stripped out
          avgPrice = ((parseFloat(value["2. high"])) + (parseFloat(value["3. low"])))/2; // Calculate average price for time period
          volume = value["5. volume"]; // total volume of stock transactions for the day
          counter++;
          timeStamp = key;
        });
        // Update timestamp
        $("#timestamp").html(timeStamp);
        // Update stock data line using count value
        var lineNumber = count + 1;
        var stockID = "#stock" + lineNumber;
        var priceID = "#price" + lineNumber;
        var volumeID = "#volume" + lineNumber;
        $(stockID).html(stockCodeList[count]);
        // If new price is valid, update display with new results
        if (!isNaN(avgPrice) && avgPrice != 0) {
          $(priceID).html(avgPrice.toFixed(3));
        }
        // If new volume is valid, update display with new results
        if (!isNaN(volume) && volume != 0) {
          $(volumeID).html(volume);
        }
        // Calculate and display change since close on previous trading day
        var changeID = "#change" + lineNumber;
        var stockCode = stockCodeList[count];
        var change = avgPrice - parseFloat(stockClosingPrice[stockCode]);
        // Format change result
        var changeResult;
        // If new change is valid, update display with new results
        if (!isNaN(change) && !isNaN(avgPrice)) {
          if (change < 0) {
            $(changeID).css("color", "red");
            changeResult = "&darr; " + change.toFixed(3);
          } else if (change > 0) {
            $(changeID).css("color", "green");
            changeResult = "&uarr; " + "+" + change.toFixed(3);
          } else {
            $(changeID).css("color", "white");
            changeResult = change.toFixed(3);
          }
        }
        var changeOutput
        $(changeID).html(changeResult);
      }
    });
  }

  // Update page with latest data
  function updatePage() {
    var count = 0;
    // Work through list of stock codes
    for (i=0; i < stockCodeList.length; i++) {
      getStockData(stockCodeList[i], count);
      count++;
    }
  }

  // Initialise page
  for (i=0; i < stockCodeList.length; i++) {
    getClosingPrice(stockCodeList[i]);
    getStockData(stockCodeList[i]);
  }
  updatePage();

  // Update stocks data once per minute
  setInterval(function() {
    updatePage();
  }, 60000);
});
