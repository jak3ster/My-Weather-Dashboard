// 
// CRITERIA
// 

// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast

var apiKey = "068d264b5222ccb80fc2752e7c04dbe9";
var today = moment().format('L');
var searchHistoryList = [];

// function for current condition
function currentCondition(citySearch) {

    var url = `https://api.openweathermap.org/data/2.5/weather?q=${citySearch}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: url,
        method: "GET"
    }).then(function(weatherResponse) {
        
        $("#weatherContent").css("display", "block");
        $("#cityDetail").empty();
        
        var iconCode = weatherResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        // WHEN I view current weather conditions for that city
        // THEN I am presented with the city name
        // the date
        // an icon representation of weather conditions
        // the temperature
        // the humidity
        // the wind speed
        var currentCity = $(`
            <h2 id="currentCity">
                ${weatherResponse.name} ${today} <img src="${iconURL}" alt="${weatherResponse.weather[0].description}" />
            </h2>
            <p>Temperature: ${weatherResponse.main.temp} °F</p>
            <p>Humidity: ${weatherResponse.main.humidity}\%</p>
            <p>Wind Speed: ${weatherResponse.wind.speed} MPH</p>
        `);

        $("#cityDetail").append(currentCity);

        // UV index
        var lat = weatherResponse.coord.lat;
        var lon = weatherResponse.coord.lon;
        var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: uviQueryURL,
            method: "GET"
        }).then(function(uviResponse) {
            // console.log(uviResponse);

            var uvIndex = uviResponse.value;
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `);

            $("#cityDetail").append(uvIndexP);

            futureCondition(lat, lon);

            // WHEN I view the UV index
            // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
            // 0-2 (green), 3-5 (yellow), 6-7 (orange), 8-10 (red), 11+ (violet)
            if (uvIndex >= 0 && uvIndex <= 2) {
                $("#uvIndexColor").css("background-color", "green").css("color", "white");
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                $("#uvIndexColor").css("background-color", "yellow").css("color", "white");
            } else if (uvIndex >= 6 && uvIndex <= 7) {
                $("#uvIndexColor").css("background-color", "orange").css("color", "white");
            } else if (uvIndex >= 8 && uvIndex <= 10) {
                $("#uvIndexColor").css("background-color", "red").css("color", "white");
            } else {
                $("#uvIndexColor").css("background-color", "violet").css("color", "white"); 
            };  
        });
    });
}

// function for future condition
function futureCondition(lat, lon) {

    // THEN I am presented with a 5-day forecast
    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function(futureResponse) {
        // console.log(futureResponse);
        $("#fiveDay").empty();
        
        for (let i = 1; i < 6; i++) {
            let date = futureResponse.daily[i].dt;
            let icon = futureResponse.daily[i].weather[0].icon;
            let temp = futureResponse.daily[i].temp.day;
            let humidity = futureResponse.daily[i].humidity;

            var currDate = moment.unix(date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

            // displays the date
            // an icon representation of weather conditions
            // the temperature
            // the humidity
            var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${temp} °F</p>
                            <p>Humidity: ${humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            $("#fiveDay").append(futureCard);
        }
    }); 
}

// add on click event listener 
$("#searchBtn").on("click", function(event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentCondition(city);
    if (!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        var searchedCity = $(`
            <li class="list-group-item">${city}</li>
            `);
        $("#searchHistory").append(searchedCity);
    };
    
    localStorage.setItem("city", JSON.stringify(searchHistoryList));
    // console.log(searchHistoryList);
    $("#enterCity").val("");
});

// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
$(document).on("click", ".list-group-item", function() {
    var listCity = $(this).text();
    currentCondition(listCity);
});

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
$(document).ready(function() {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentCondition(lastSearchedCity);
        console.log(`Last searched city: ${lastSearchedCity}`);
    }
});

