$( document ).ready(function() {
    console.log( "ready!" );

   
    var API_KEY = '097b0aa58b75eb7fc082380d292354b7';

    
    $('#hourly a[href="#hourly"]').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });
    $('#daily a[href="#daily"]').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });

    
    if(navigator.geolocation) {
        console.log('OK');
        navigator.geolocation.getCurrentPosition(start);
    } else {
      
      alert("Location Not Found");
    }

   
    function start(position){
      console.log(position);
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;

      $('#coords').text("[" + longitude.toFixed(2) + ", " + latitude.toFixed(2) + "]");

      $.get(build_url('weather', position.coords), function(data){
          console.log(data);

          display_current(data);
      });

      $.get(build_url('forecast', position.coords), function(data){
          console.log(data);

          display_forecast(data);
      });

      $.get(build_url('forecast/daily', position.coords), function(data){
            console.log(data);

            display_forecast_daily(data);
          });

    }


    
    function display_current(data){
      $('#city').text(data.name);

      $('#weather').html('<img src="http://openweathermap.org/img/w/'
        + data.weather[0].icon
        + '.png" aria-hidden="true">'
        + data.main.temp + "°C");

      $('#description').text(data.weather[0].description);
      $('#wind').text(data.wind.speed + "m/s");
      $('#cloudiness').text(data.clouds.all + "%")
      $("#humidity").text(data.main.humidity + "%");
      $('#pressure').text(data.main.pressure + "hpa");

      // http://momentjs.com/docs/#/parsing/unix-timestamp/ => librairie pour gérer date et heure
      $("#sunset").text(moment.unix(data.sys.sunset).format("LT"));
      $("#sunrise").text(moment.unix(data.sys.sunrise).format("LT"));
    }

    function display_forecast(data){

      var hours = [],
          temps = [],
          rains = [];

      data.list.forEach(function(el){

        hours.push(moment.unix(el.dt).format("LT"));
        temps.push(el.main.temp);
        if (el.rain['3h'] != undefined) {
              // rain.push(0);
              rains.push(el.rain['3h']);
          } else {
              // rain.push(el.rain['3h']);
              rains.push(0);
          }
      });

      // initialisation du graphic highchart
      display_graphic('#chart-container-hourly', hours, rains, temps, 'de la journé');
}
    // affichage des prévisions journalière
    function display_forecast_daily(data) {
        var days = [],
            temps = [],
            rains = [];
        data.list.forEach(function (el) {

            days.push(moment.unix(el.dt).format("DD/MM"));
            temps.push(el.temp.day);
            if (typeof el.rain == 'undefined') {
                rains.push(0);
            } else {
                rains.push(el.rain);
            }

        }); //fin foreach

    display_graphic('#chart-container-daily', days, rains, temps, 'de la semaine');

    }
     function display_graphic(id, moment, weather, temps, title){

       $(id).highcharts({

               // titre du tableau
               chart: {
                   type: 'spline'
               },
               title: {
                   text: 'Prévisions '+title,
                   x: -20 //center
               },

               subtitle: {
                   text: 'Source: open weather',
                   x: -20 //center
               },

               // axe horizontale
               xAxis: {
                   categories: moment.slice(0, 24)
               },
               // premier axe verticale
               yAxis: [{
                       className: 'highcharts-color-0',
                       title: {
                           text: 'Temperature'
                       },
                       labels: {
                           format: '{value} °C'
                       },
                       opposite: false
                   },
                   // second axe verticale
                   {
                       className: 'highcharts-color-1',
                       title: {
                           text: 'Precipitation'
                       },
                       labels: {
                           format: '{value} mm',
                       },
                       opposite: true
               }],

               legend: {
                   align: 'center',
                   verticalAlign: 'bottom',
                   y: 20,
                   floating: true,
               },

               tooltip: {
                   shared: true,
                   crosshairs: true
               },

               plotOptions: {
                   spline: {
                       dataLabels: {
                           className: 'highlight',
                           enabled: true,
                           y: -10,
                           shape: 'callout'
                       }
                   }
               },

               series: [{
                       name: 'Precipitation',
                       type: 'column',
                       yAxis: 1,
                       data: weather.slice(0, 10)
                   },{
                       name: 'Temperatures',
                       type: 'spline',
                       data: temps.slice(0, 11)
                   }]

           });

     }

    function build_url(type, coords){
      var url = "http://api.openweathermap.org/data/2.5/"
        + type
        + "?lat=" + coords.latitude
        + "&lon=" + coords.longitude
        + "&APPID=" + API_KEY
        + "&lang=fr&units=metric";

      return url;
    }

}); // end $( document ).ready(function()
