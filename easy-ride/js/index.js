// Generated by CoffeeScript 1.4.0
var rideSearcher,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

rideSearcher = rideSearcher || {};

require(['components/map-route', 'components/input/date-picker', 'components/input/text-input'], function(MapRoute, DatePicker, TextInput) {
  var RequestRideModal, RideSearcher, RouteRenderer;
  RideSearcher = (function() {

    function RideSearcher() {
      this.requestRide = __bind(this.requestRide, this);

      this.processResults = __bind(this.processResults, this);

      this.toJson = __bind(this.toJson, this);

      this.setButton = __bind(this.setButton, this);

      this.clearTrips = __bind(this.clearTrips, this);

      this.searchResults = __bind(this.searchResults, this);

      var _this = this;
      this.mapOptions = {
        center: new google.maps.LatLng(51.517099, -0.146084),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map($('#map_canvas')[0], this.mapOptions);
      this.womenOnly = $('#search-women-only');
      this.departure = new DatePicker($('#search-departure'), $('#search-departure-date'), false);
      this.route = new MapRoute($('#search-route'), this.map, $('#search-from'), $('#search-to'));
      this.searchButton = $('#search-button');
      this.searchButton.click(function() {
        var data;
        if (_this.searchButton.hasClass('disabled')) {
          return null;
        }
        data = _this.toJson();
        if (data === null) {
          return null;
        }
        console.log(data);
        _this.setButton('btn btn-primary disabled', 'Searching...');
        return $.ajax({
          url: '/index_ajax.php',
          type: 'GET',
          data: {
            'data': JSON.stringify(data)
          },
          success: _this.searchResults,
          error: function(data) {
            return this.setButton('btn btn-danger', 'Error!');
          }
        });
      });
      this.tripTemplate = _.template($('#trip-template').html());
      this.trips = $('#trips');
      this.requestModal = new RequestRideModal();
    }

    RideSearcher.prototype.searchResults = function(data) {
      var error, json;
      console.log(data);
      error = 'Unknown Error!';
      json = JSON.parse(data);
      if (json) {
        if (json['status'] === 'OK') {
          this.clearTrips();
          if (json['trips'].length === 0) {
            this.setButton('btn btn-primary', 'No trips found');
          } else {
            this.processResults(json['trips']);
            this.setButton('btn btn-primary', 'Search');
          }
          return;
        } else {
          error = json['msg'];
        }
      }
      return this.setButton('btn btn-danger', error);
    };

    RideSearcher.prototype.clearTrips = function() {
      return this.trips.html('');
    };

    RideSearcher.prototype.setButton = function(btnClass, msg) {
      this.searchButton.attr('class', btnClass);
      return this.searchButton.html("<i class='icon icon-white icon-search'></i> " + msg);
    };

    RideSearcher.prototype.toJson = function() {
      var json;
      json = {
        departure: this.departure.getTime(),
        women_only: this.womenOnly.prop('checked'),
        route: this.route.toJson()
      };
      if (json['route'] === null || json['women_only'] === null) {
        return null;
      }
      return json;
    };

    RideSearcher.prototype.processResults = function(trips) {
      var id, routeRenderer, trip, tripHTML, _i, _len;
      this.tripsTable = {};
      this.trips.hide();
      for (_i = 0, _len = trips.length; _i < _len; _i++) {
        trip = trips[_i];
        id = trip['id'];
        trip.departure_string = (new Date(parseInt(trip.departure_time) * 1000)).toLocaleString();
        routeRenderer = new RouteRenderer(this.map, trip);
        tripHTML = this.tripTemplate(trip);
        this.trips.append(tripHTML);
        $("#trip-" + id).hover(routeRenderer.hoverIn, routeRenderer.hoverOut);
        $("#request-trip-" + id).click(this.requestRide);
        this.tripsTable[id] = trip;
      }
      return this.trips.slideDown(1000);
    };

    RideSearcher.prototype.requestRide = function(e) {
      var button, tripId;
      tripId = parseInt(e.target.id.split('-')[2]);
      button = $("#" + e.target.id);
      if ($('#logged-in').length === 0) {
        button.attr('class', 'btn btn-danger btn-small');
        button.text('Login Required!');
        return;
      }
      this.requestModal.reset();
      console.log("TripID: " + tripId);
      console.log(this.tripsTable[tripId]);
      this.requestModal.load(this.tripsTable[tripId]);
      return this.requestModal.show();
    };

    return RideSearcher;

  })();
  RouteRenderer = (function() {

    function RouteRenderer(map, route) {
      var request,
        _this = this;
      this.map = map;
      this.route = route;
      this.hoverOut = __bind(this.hoverOut, this);

      this.hoverIn = __bind(this.hoverIn, this);

      this.mapRendererOptions = {
        markerOptions: {
          visible: false
        },
        polylineOptions: {
          strokeOpacity: 0.0,
          strokeWeight: 4
        }
      };
      this.directionsDisplay = new google.maps.DirectionsRenderer(this.mapRendererOptions);
      this.directionsDisplay.setMap(this.map);
      request = {
        origin: route['origin']['address'],
        destination: route['destination']['address'],
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'uk'
      };
      this.directionsService = new google.maps.DirectionsService();
      this.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          return _this.directionsDisplay.setDirections(result);
        }
      });
    }

    RouteRenderer.prototype.hoverIn = function(e) {
      this.mapRendererOptions.polylineOptions.strokeOpacity = 0.8;
      return this.directionsDisplay.setMap(this.map);
    };

    RouteRenderer.prototype.hoverOut = function(e) {
      this.mapRendererOptions.polylineOptions.strokeOpacity = 0.0;
      return this.directionsDisplay.setMap(this.map);
    };

    return RouteRenderer;

  })();
  RequestRideModal = (function() {

    function RequestRideModal() {
      this.submit = __bind(this.submit, this);

      this.toJson = __bind(this.toJson, this);

      this.reset = __bind(this.reset, this);

      this.show = __bind(this.show, this);

      this.load = __bind(this.load, this);
      this.el = $('#modal-request-ride');
      this.info = $('#modal-trip-info');
      this.requestMessage = new TextInput($('#modal-trip-request-message').parent().parent(), $('#modal-trip-request-message'), true);
      this.submitButton = $('#modal-request-ride-submit');
      this.submitButton.click(this.submit);
      this.tripTemplate = _.template($('#trip-modal-template').html());
    }

    RequestRideModal.prototype.load = function(trip) {
      this.tripId = trip['id'];
      console.log(trip);
      return this.info.append(this.tripTemplate(trip));
    };

    RequestRideModal.prototype.show = function() {
      return this.el.modal('show');
    };

    RequestRideModal.prototype.reset = function() {
      return this.info.html('');
    };

    RequestRideModal.prototype.toJson = function() {
      var json, message;
      message = this.requestMessage.getValue();
      if (message) {
        json = {
          'message': message,
          'trip_id': this.tripId
        };
        return json;
      }
      return null;
    };

    RequestRideModal.prototype.submit = function(e) {
      return console.log(this.toJson());
    };

    return RequestRideModal;

  })();
  return rideSearcher = new RideSearcher();
});
