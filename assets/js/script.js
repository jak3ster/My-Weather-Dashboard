/**
 * CRITERIA
 */

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

const getData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    const json = await response.json();
    return json;
}

function currentCondition(city_search){
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city_search}&units=imperial&appid=${apiKey}`;
    getData(queryURL).then(data => {
        // console.log(data);
    
        let weatherContent = document.querySelector("#weatherContent");
        weatherContent.style.display = 'block';
    
        $("#weatherContent").css("display", "block");
        $("#cityDetail").empty();
    
        var iconCode = data.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
    
        // console.log(iconCode);
        // console.log(iconURL);
        // WHEN I view current weather conditions for that city
        // THEN I am presented with the city name
        // the date
        // an icon representation of weather conditions
        // the temperature
        // the humidity
        // the wind speed
    
        var currentCity = `
                <h2 id="currentCity">
                    ${data.name} ${today} <img src="${iconURL}" alt="${data.weather[0].description}" />
                </h2>
                <p>Temperature: ${data.main.temp} °F</p>
                <p>Humidity: ${data.main.humidity}\%</p>
                <p>Wind Speed: ${data.wind.speed} MPH</p>
            `;
        // console.log(currentCity);
    
        $("#cityDetail").append(currentCity);
    
        // UV index
        var lat = data.coord.lat;
        var lon = data.coord.lon;
        var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
        getData(uviQueryURL).then(data => {
            // console.log(data);
            var uvIndex = data.value;
            var uvIndexP = `
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `;
    
            $("#cityDetail").append(uvIndexP);
    
            futureCondition(lat, lon);
    
            // WHEN I view the UV index
            // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
            // 0-2 green, 3-5 yellow, 6-7 orange, 8-10 red, 11+violet
            let uvIndexColor = document.querySelector("#uvIndexColor");
            if (uvIndex >= 0 && uvIndex <= 2) {
                uvIndexColor.style.backgroundColor = "green"
                uvIndexColor.style.color = "white";
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                uvIndexColor.style.backgroundColor = "yellow"
            } else if (uvIndex >= 6 && uvIndex <= 7) {
                uvIndexColor.style.backgroundColor = "orange"
            } else if (uvIndex >= 8 && uvIndex <= 10) {
                uvIndexColor.style.backgroundColor = "red"
                uvIndexColor.style.color = "white";
            } else {
                uvIndexColor.style.backgroundColor = "violet"
                uvIndexColor.style.color = "white";
            }; 
        }).catch(err => {
            console.error(err);
        });
    }).catch(err => {
        console.error(err);
    });
}


// function for future condition
function futureCondition(lat, lon) {

    // THEN I am presented with a 5-day forecast
    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    getData(futureURL).then(data => {
        console.log(data);
        let fiveDay = $("#fiveDay");

        for (let i = 1; i < 6; i++) {
            var cityInfo = {
                date: data.daily[i].dt,
                icon: data.daily[i].weather[0].icon,
                temp: data.daily[i].temp.day,
                humidity: data.daily[i].humidity
            };
            console.log(cityInfo);

            var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${data.daily[i].weather[0].main}" />`;

            // displays the date
            // an icon representation of weather conditions
            // the temperature
            // the humidity
            futureCard = `
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `;
            fiveDay.append(futureCard);
        }
    }).catch(err => {
        console.error(err);
    });
}

// add on click event listener 
$("#searchBtn").on("click", function (event) {
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
});

// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
$(document).on("click", ".list-group-item", function () {
    var listCity = $(this).text();
    currentCondition(listCity);
});

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
$(document).ready(function () {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentCondition(lastSearchedCity);
    }
});