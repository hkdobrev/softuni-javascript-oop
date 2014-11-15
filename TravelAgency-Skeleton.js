function processTravelAgencyCommands(commands) {
    'use strict';

    var Models = (function() {

        /**
         * Check if a variable is a valid non-empty string
         *
         * @param  mixed  value
         * @return Boolean
         */
        function isValidString (value) {
            return typeof value === 'string' && value !== '';
        }

        var Destination = (function() {

            /**
             * @constructor
             */
            function Destination(location, landmark) {
                this.setLocation(location);
                this.setLandmark(landmark);
            }

            Destination.prototype.getLocation = function() {
                return this._location;
            }

            Destination.prototype.setLocation = function(location) {
                if ( ! isValidString(location)) {
                    throw new Error("Location cannot be empty or undefined.");
                }
                this._location = location;
            }

            Destination.prototype.getLandmark = function() {
                return this._landmark;
            }

            Destination.prototype.setLandmark = function(landmark) {
                if ( ! isValidString(landmark)) {
                    throw new Error("Landmark cannot be empty or undefined.");
                }
                this._landmark = landmark;
            }

            Destination.prototype.toString = function() {
                return this.constructor.name + ": " +
                    "location=" + this.getLocation() +
                    ",landmark=" + this.getLandmark();
            }

            return Destination;
        }());

        var Travel = (function() {

            /**
             * @abstract
             * @constructor
             */
            function Travel(name, startDate, endDate, price) {
                if (this.constructor === Travel) {
                    throw new Error('You cannot instantiate Travel directly! Use a sub type.');
                }
                this.setName(name);
                this.setStartDate(startDate);
                this.setEndDate(endDate);
                this.setPrice(price);

                return this;
            }

            Travel.prototype.getName = function() {
                return this._name;
            }

            Travel.prototype.setName = function(name) {
                if ( ! isValidString(name)) {
                    throw new Error('Name must be a non-empty string!');
                }
                this._name = name;

                return this;
            }

            Travel.prototype.getPrice = function() {
                return this._price;
            }

            Travel.prototype.setPrice = function(price) {
                if (isNaN(price) || typeof price !== 'number' || price < 0) {
                    throw new Error('Price must be non-negative number!');
                }
                this._price = price;

                return this;
            }

            Travel.prototype.getStartDate = function() {
                return this._startDate;
            }

            Travel.prototype.setStartDate = function(startDate) {
                if ( ! (startDate instanceof Date)) {
                    throw new Error('StartDate must be a Date object!');
                }
                this._startDate = startDate;

                return this;
            }

            Travel.prototype.getEndDate = function() {
                return this._endDate;
            }

            Travel.prototype.setEndDate = function(endDate) {
                if ( ! (endDate instanceof Date)) {
                    throw new Error('EndDate must be a Date object!');
                }

                if (this._startDate && this._endDate < this._startDate) {
                    throw new Error('End date must be later than start date!');
                }

                this._endDate = endDate;

                return this;
            }

            Travel.prototype.toString = function() {
                return ' * ' + this.constructor.name + ": " +
                    'name=' + this.getName() +
                    ',start-date=' + formatDate(this.getStartDate()) +
                    ',end-date=' + formatDate(this.getEndDate()) +
                    ',price=' + this.getPrice().toFixed(2);
            }

            return Travel;
        }());

        var Excursion = (function() {

            /**
             * @extends Travel
             * @constructor
             */
            function Excursion(name, startDate, endDate, price, transport) {
                // Call parent constructor
                var base = Travel.apply(this, arguments);

                this._destinations = [];

                base.setTransport(transport);

                return base;
            }

            // Inherit from Travel
            Excursion.prototype = Object.create(Travel.prototype);
            Excursion.prototype.constructor = Excursion;

            Excursion.prototype.getTransport = function() {
                return this._transport;
            }

            Excursion.prototype.setTransport = function(transport) {
                if ( ! isValidString(transport)) {
                    throw new Error('Transport must be a non-empty string!');
                }
                this._transport = transport;

                return this;
            }

            Excursion.prototype.getDestinations = function() {
                return this._destinations;
            }

            Excursion.prototype.addDestination = function(destination) {
                if ( ! (destination instanceof Destination)) {
                    throw new Error('Destination must be an instance of Destination!');
                }

                this._destinations.push(destination);

                return this;
            }

            Excursion.prototype.removeDestination = function(destination) {
                if ( ! (destination instanceof Destination)) {
                    throw new Error('Destination must be an instance of Destination!');
                }

                var destinationIndex = this._destinations.indexOf(destination);

                if (destinationIndex === -1) {
                    throw new Error('No such destination!');
                }

                // Remove the destination at the index found
                this._destinations.splice(destinationIndex, 1);

                return this;
            }

            Excursion.prototype.toString = function () {
                return Travel.prototype.toString.apply(this, arguments) +
                    (
                        this.getTransport() ?
                        ',transport=' + this.getTransport() :
                        ''
                    ) + "\n" +
                    ' ** Destinations: ' + (
                        this._destinations.length ?
                            this._destinations.map(function(destination) {
                                return destination.toString();
                            }).join(';') :
                            '-'
                    );
            }

            return Excursion;
        }());

        var Vacation = (function() {

            /**
             * @extends Travel
             * @constructor
             */
            function Vacation(name, startDate, endDate, price, location, accommodation) {
                // Call parent constructor
                var base = Travel.apply(this, arguments);

                base.setLocation(location);

                if (accommodation !== undefined) {
                    base.setAccommodation(accommodation);
                }

                return base;
            }

            // Inherit from Travel
            Vacation.prototype = Object.create(Travel.prototype);
            Vacation.prototype.constructor = Vacation;

            Vacation.prototype.getLocation = function() {
                return this._location;
            }

            Vacation.prototype.setLocation = function(location) {
                if ( ! isValidString(location)) {
                    throw new Error('Location must be a non-empty string!');
                }
                this._location = location;

                return this;
            }

            Vacation.prototype.getAccommodation = function() {
                return this._accommodation;
            }

            Vacation.prototype.setAccommodation = function(accommodation) {
                if ( ! isValidString(accommodation)) {
                    throw new Error('Accommodation must be a non-empty string!');
                }
                this._accommodation = accommodation;

                return this;
            }

            Vacation.prototype.toString = function () {
                return Travel.prototype.toString.apply(this, arguments) +
                    ',location=' + this.getLocation() +
                    (this.getAccommodation() ? ',accommodation=' + this.getAccommodation() : '');
            }

            return Vacation;
        }());

        var Cruise = (function() {

            /**
             * @extends Excursion
             * @constructor
             */
            function Cruise(name, startDate, endDate, price, startDock) {
                // Call parent constructor
                var base = Excursion.apply(this, [name, startDate, endDate, price, 'cruise liner']);

                if (startDock !== undefined) {
                    base.setStartDock(startDock);
                }

                return base;
            }

            // Inherit from Excursion
            Cruise.prototype = Object.create(Excursion.prototype);
            Cruise.prototype.constructor = Cruise;

            Cruise.prototype.getStartDock = function() {
                return this._startDock;
            }

            Cruise.prototype.setStartDock = function(startDock) {
                if ( ! isValidString(startDock)) {
                    throw new Error('StartDock must be a non-empty string!');
                }
                this._startDock = startDock;

                return this;
            }

            return Cruise;
        }());

        return {
            Destination: Destination,
            Vacation: Vacation,
            Excursion: Excursion,
            Cruise: Cruise
        }
    }());

    var TravellingManager = (function(){
        var _travels;
        var _destinations;

        function init() {
            _travels = [];
            _destinations = [];
        }

        var CommandProcessor = (function() {

            function processInsertCommand(command) {
                var object;

                switch (command["type"]) {
                    case "excursion":
                        object = new Models.Excursion(command["name"], parseDate(command["start-date"]), parseDate(command["end-date"]),
                            parseFloat(command["price"]), command["transport"]);
                        _travels.push(object);
                        break;
                    case "vacation":
                        object = new Models.Vacation(command["name"], parseDate(command["start-date"]), parseDate(command["end-date"]),
                            parseFloat(command["price"]), command["location"], command["accommodation"]);
                        _travels.push(object);
                        break;
                    case "cruise":
                        object = new Models.Cruise(command["name"], parseDate(command["start-date"]), parseDate(command["end-date"]),
                            parseFloat(command["price"]), command["start-dock"]);
                        _travels.push(object);
                        break;
                    case "destination":
                        object = new Models.Destination(command["location"], command["landmark"]);
                        _destinations.push(object);
                        break;
                    default:
                        throw new Error("Invalid type.");
                }

                return object.constructor.name + " created.";
            }

            function processDeleteCommand(command) {
                var object,
                    index,
                    destinations;

                switch (command["type"]) {
                    case "destination":
                        object = getDestinationByLocationAndLandmark(command["location"], command["landmark"]);
                        _travels.forEach(function(t) {
                            if (t instanceof Models.Excursion && t.getDestinations().indexOf(object) !== -1) {
                                t.removeDestination(object);
                            }
                        });
                        index = _destinations.indexOf(object);
                        _destinations.splice(index, 1);
                        break;
                    case "excursion":
                    case "vacation":
                    case "cruise":
                        object = getTravelByName(command["name"]);
                        index = _travels.indexOf(object);
                        _travels.splice(index, 1);
                        break;
                    default:
                        throw new Error("Unknown type.");
                }

                return object.constructor.name + " deleted.";
            }

            function processListCommand(command) {
                return formatTravelsQuery(_travels);
            }

            function processAddDestinationCommand(command) {
                var destination = getDestinationByLocationAndLandmark(command["location"], command["landmark"]),
                    travel = getTravelByName(command["name"]);

                if (!(travel instanceof Models.Excursion)) {
                    throw new Error("Travel does not have destinations.");
                }
                travel.addDestination(destination);

                return "Added destination to " + travel.getName() + ".";
            }

            function processRemoveDestinationCommand(command) {
                var destination = getDestinationByLocationAndLandmark(command["location"], command["landmark"]),
                    travel = getTravelByName(command["name"]);

                if (!(travel instanceof Models.Excursion)) {
                    throw new Error("Travel does not have destinations.");
                }
                travel.removeDestination(destination);

                return "Removed destination from " + travel.getName() + ".";
            }

            function processFilterTravelsCommand (command) {
                var travels = _travels;

                if (command['type'] !== 'all') {
                    travels = _travels.filter(function(travel) {
                        return travel.constructor.name.toLowerCase() === command['type'] &&
                            travel.getPrice() >= command['price-min'] &&
                            travel.getPrice() <= command['price-max'];
                    });
                }

                travels.sort(function (a, b) {
                    if (a.getStartDate() < b.getStartDate()) {
                        return a;
                    }

                    if (a.getStartDate > b.getStartDate()) {
                        return b;
                    }

                    return a.getName().localeCompare(b);
                });

                return formatTravelsQuery(travels);
            }

            function getTravelByName(name) {
                var i;

                for (i = 0; i < _travels.length; i++) {
                    if (_travels[i].getName() === name) {
                        return _travels[i];
                    }
                }
                throw new Error("No travel with such name exists.");
            }

            function getDestinationByLocationAndLandmark(location, landmark) {
                var i;

                for (i = 0; i < _destinations.length; i++) {
                    if (_destinations[i].getLocation() === location
                        && _destinations[i].getLandmark() === landmark) {
                        return _destinations[i];
                    }
                }
                throw new Error("No destination with such location and landmark exists.");
            }

            function formatTravelsQuery(travelsQuery) {
                var queryString = "";

                if (travelsQuery.length > 0) {
                    queryString += travelsQuery.join("\n");
                } else {
                    queryString = "No results.";
                }

                return queryString;
            }

            return {
                processInsertCommand: processInsertCommand,
                processDeleteCommand: processDeleteCommand,
                processListCommand: processListCommand,
                processAddDestinationCommand: processAddDestinationCommand,
                processRemoveDestinationCommand: processRemoveDestinationCommand,
                processFilterTravelsCommand: processFilterTravelsCommand
            }
        }());

        var Command = (function() {
            function Command(cmdLine) {
                this._cmdArgs = processCommand(cmdLine);
            }

            function processCommand(cmdLine) {
                var parameters = [],
                    matches = [],
                    pattern = /(.+?)=(.+?)[;)]/g,
                    key,
                    value,
                    split;

                split = cmdLine.split("(");
                parameters["command"] = split[0];
                while ((matches = pattern.exec(split[1])) !== null) {
                    key = matches[1];
                    value = matches[2];
                    parameters[key] = value;
                }

                return parameters;
            }

            return Command;
        }());

        function executeCommands(cmds) {
            var commandArgs = new Command(cmds)._cmdArgs,
                action = commandArgs["command"],
                output;

            switch (action) {
                case "insert":
                    output = CommandProcessor.processInsertCommand(commandArgs);
                    break;
                case "delete":
                    output = CommandProcessor.processDeleteCommand(commandArgs);
                    break;
                case "add-destination":
                    output = CommandProcessor.processAddDestinationCommand(commandArgs);
                    break;
                case "remove-destination":
                    output = CommandProcessor.processRemoveDestinationCommand(commandArgs);
                    break;
                case "list":
                    output = CommandProcessor.processListCommand(commandArgs);
                    break;
                case "filter":
                    output = CommandProcessor.processFilterTravelsCommand(commandArgs);
                    break;
                default:
                    throw new Error("Unsupported command.");
            }

            return output;
        }

        return {
            init: init,
            executeCommands: executeCommands
        }
    }());

    var parseDate = function (dateStr) {
        if (!dateStr) {
            return undefined;
        }
        var date = new Date(Date.parse(dateStr.replace(/-/g, ' ')));
        var dateFormatted = formatDate(date);
        if (dateStr != dateFormatted) {
            throw new Error("Invalid date: " + dateStr);
        }
        return date;
    }

    var formatDate = function (date) {
        var day = date.getDate();
        var monthName = date.toString().split(' ')[1];
        var year = date.getFullYear();
        return day + '-' + monthName + '-' + year;
    }

    var output = "";
    TravellingManager.init();

    commands.forEach(function(cmd) {
        var result;
        if (cmd != "") {
            try {
                result = TravellingManager.executeCommands(cmd) + "\n";
            } catch (e) {
                result = "Invalid command." + "\n";
            }
            output += result;
        }
    });

    return output;
}

// ------------------------------------------------------------
// Read the input from the console as array and process it
// Remove all below code before submitting to the judge system!
// ------------------------------------------------------------

(function() {
    var arr = [];
    if (typeof (require) == 'function') {
        // We are in node.js --> read the console input and process it
        require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        }).on('line', function(line) {
            arr.push(line);
        }).on('close', function() {
            console.log(processTravelAgencyCommands(arr));
        });
    }
})();
