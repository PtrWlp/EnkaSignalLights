const USBRelay = require("@josephdadams/usbrelay");
const relay = new USBRelay(); //gets the first connected relay
relay.setState(0, false); // relay number 0 references all relays of the device, false is off
