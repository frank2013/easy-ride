// Generated by CoffeeScript 1.4.0
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

jQuery(function() {
  var DateTime, MapRoute, RequiredInput, RideSharer, UserInterface;
  RideSharer = (function() {

    function RideSharer() {
      this.toJson = __bind(this.toJson, this);

      this.setButton = __bind(this.setButton, this);

      var _this = this;
      this.departure = new DateTime($('#share-departure'), $('#share-departure-date'), $('#share-departure-time'));
      this.route = new MapRoute($('#share-route'), $('#share-from'), $('#share-to'), $('#share-trip-length'));
      this.message = $('#share-message');
      this.womenOnly = $('#share-women-only');
      this.shareButton = $('#share-button');
      this.shareButton.click(function() {
        var data;
        if (_this.shareButton.hasClass('disabled')) {
          return;
        }
        data = _this.toJson();
        if (data === null) {
          return;
        }
        console.log(data);
        return $.ajax({
          url: '/addTripInfo.php',
          type: 'POST',
          data: {
            'data': JSON.stringify(data)
          },
          success: function(data) {
            return _this.setButton('disabled btn btn-success', 'Trip Saved!');
          },
          error: function(data) {
            return this.setButton('disabled btn btn-danger', 'Error!');
          }
        });
      });
    }

    RideSharer.prototype.setButton = function(btnClass, msg) {
      this.shareButton.attr('class', btnClass);
      return this.shareButton.text(msg);
    };

    RideSharer.prototype.toJson = function() {
      var json, key, value;
      json = {
        departure: this.departure.getDateTime(),
        route: this.route.toJson(),
        message: this.message.val(),
        women_only: this.womenOnly.prop('checked')
      };
      for (key in json) {
        value = json[key];
        if (value === null) {
          return null;
        }
      }
      return json;
    };

    return RideSharer;

  })();
  UserInterface = (function() {

    function UserInterface(container) {
      this.container = container;
      this.removeError = __bind(this.removeError, this);

      this.setError = __bind(this.setError, this);

    }

    /*
                Set error.
                Args:
                    msg {String}: error message string.
    */


    UserInterface.prototype.setError = function(msg) {
      var error;
      this.removeError();
      this.container.addClass('error');
      error = $('<div>', {
        "class": 'controls help-inline error-msg'
      }).append(msg);
      return this.container.append(error);
    };

    /*
                Remove error.
    */


    UserInterface.prototype.removeError = function() {
      this.container.removeClass('error');
      return this.container.children().filter('.error-msg').remove();
    };

    return UserInterface;

  })();
  /*
          A Google Maps based Route module for finding a origin and destination
          information with trip length.
  */

  MapRoute = (function(_super) {

    __extends(MapRoute, _super);

    function MapRoute(container, from, to, tripLength) {
      this.container = container;
      this.from = from;
      this.to = to;
      this.toJson = __bind(this.toJson, this);

      this.updateRoute = __bind(this.updateRoute, this);

      this.calculateRoute = __bind(this.calculateRoute, this);

      MapRoute.__super__.constructor.call(this, this.container);
      this.tripLength = new RequiredInput(tripLength.parent().parent(), tripLength);
      this.result;
      this.directionsDisplay = new google.maps.DirectionsRenderer();
      this.directionsService = new google.maps.DirectionsService();
      this.mapOptions = {
        center: new google.maps.LatLng(51.517099, -0.146084),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map($('#map_canvas')[0], this.mapOptions);
      this.mapMarkers = [];
      this.directionsDisplay.setMap(this.map);
      this.from.change(this.calculateRoute);
      this.to.change(this.calculateRoute);
    }

    /*
                Uses Google Maps Directions API to calculate the route for the data
                entered by the user.
    */


    MapRoute.prototype.calculateRoute = function() {
      var from, request, to,
        _this = this;
      from = this.from.val().trim();
      to = this.to.val().trim();
      if (!from || !to) {
        return;
      }
      request = {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'uk'
      };
      return this.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          _this.directionsDisplay.setDirections(result);
          _this.result = result;
          _this.removeError();
          return _this.updateRoute();
        } else {
          _this.result = null;
          return _this.setError('No routes found.');
        }
      });
    };

    /*
                Updates the form on the page to reflect the results of a route.
    */


    MapRoute.prototype.updateRoute = function() {
      var leg, route;
      route = this.result['routes'][0];
      leg = route['legs'][0];
      console.log(leg);
      this.from.val(leg['start_address']);
      this.to.val(leg['end_address']);
      return this.tripLength.setValue(leg['duration']['text']);
    };

    /*
                Returns the route in JSON form if it exists.
    */


    MapRoute.prototype.toJson = function() {
      var from, json, leg, length, route, to;
      if (!this.result) {
        this.setError('No route specified.');
        return null;
      }
      route = this.result['routes'][0];
      leg = route['legs'][0];
      from = {
        address: leg['start_address'],
        lat: leg['start_location']['hb'],
        lon: leg['start_location']['ib']
      };
      to = {
        address: leg['end_address'],
        lat: leg['end_location']['hb'],
        lon: leg['end_location']['ib']
      };
      length = this.tripLength.getValue();
      if (!length) {
        return null;
      }
      json = {
        from: from,
        to: to,
        trip_length: length
      };
      console.log(json);
      this.removeError();
      return json;
    };

    return MapRoute;

  })(UserInterface);
  /*
          A DateTime module that uses a Bootstrap DatePicker and TimePicker and
          combines the input.
  */

  DateTime = (function(_super) {

    __extends(DateTime, _super);

    function DateTime(container, date, time) {
      this.container = container;
      this.parseTime = __bind(this.parseTime, this);

      this.getDateTime = __bind(this.getDateTime, this);

      DateTime.__super__.constructor.call(this, this.container);
      this.date = date.datepicker().data('datepicker');
      this.time = time.timepicker();
    }

    /*
                Returns departure time as an integer value, if entered
    */


    DateTime.prototype.getDateTime = function() {
      var date, dateString, time, timeString;
      dateString = this.date.element.children().filter('input').val();
      timeString = this.time.val();
      if (!dateString || !timeString) {
        this.setError('Missing departure information.');
        return null;
      }
      time = this.parseTime(timeString);
      date = this.date.date.valueOf() / 1000;
      this.removeError();
      return date + time;
    };

    /*
                Parses the time and returns the integer value in seconds.
                Args:
                    string {String}: time string e.g. '04:50 PM'
    */


    DateTime.prototype.parseTime = function(string) {
      var hours, meridiem, minutes, strings, time;
      strings = string.split(' ');
      time = strings[0].split(':');
      meridiem = strings[1];
      hours = parseInt(time[0]);
      minutes = parseInt(time[1]);
      if (meridiem === 'PM') {
        hours += 12;
      }
      return hours * 3600 + minutes * 60;
    };

    return DateTime;

  })(UserInterface);
  RequiredInput = (function(_super) {

    __extends(RequiredInput, _super);

    function RequiredInput(container, input) {
      this.container = container;
      this.input = input;
      this.setValue = __bind(this.setValue, this);

      this.getValue = __bind(this.getValue, this);

      RequiredInput.__super__.constructor.call(this, this.container);
    }

    RequiredInput.prototype.getValue = function() {
      var inputString;
      inputString = this.input.val().trim();
      if (!inputString) {
        this.setError('Required field.');
        return null;
      } else {
        this.removeError();
        return inputString;
      }
    };

    RequiredInput.prototype.setValue = function(val) {
      this.input.val(val);
      return this.removeError();
    };

    return RequiredInput;

  })(UserInterface);
  return new RideSharer();
});
