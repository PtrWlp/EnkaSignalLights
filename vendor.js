
const USBRelay = require("@josephdadams/usbrelay");
const relay = new USBRelay(); //gets the first connected relay
console.log(USBRelay.Relays); //returns an array with HID data including paths
