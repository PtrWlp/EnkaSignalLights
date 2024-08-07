const USBRelay = require("@josephdadams/usbrelay");
let relay;

try {
  relay = new USBRelay(); //gets the first connected relay
  } catch (error) {
    // MOCK FOR RELAY
  let currentState = ['-', '-', '-', '-'];
  relay = {
    setState(relay, state) {
      const prevState = currentState.join('');
      if (relay === 0) {
        currentState = ['-', '-', '-', '-'];
        process.stdout.cursorTo(0);
          process.stdout.write('\u001b[0m' + '----             ');
      } else {
        currentState[relay-1] = state ? '@' : '-';
        if (prevState !== currentState.join('')) {
          // console.log(currentState.join(''));
          process.stdout.cursorTo(0);
          process.stdout.write(
            (currentState[0] === '-' ? '\u001b[0m-' : '\u001b[31m@') +
            (currentState[1] === '-' ? '\u001b[0m-' : '\u001b[32m@') +
            (currentState[2] === '-' ? '\u001b[0m-' : '\u001b[1;34m@') +
            (currentState[3] === '-' ? '\u001b[0m-' : '\u001b[93m@') +
            '\u001b[0m' + '                 ');
        }
      }
    },
    getState(relay) {
      return currentState[relay-1] !== '-';
    }
  };
}

relay.setState(0, false); // relay number 0 references all relays of the device, false is off

const lampStates = ['0','1','2'];  // off/on/blinking Trinary :-)
const lamps = [1,2,3,4];

const heartbeat = 500; // milliseconds, determines blink rate
let currentTick; // A counter
var allCombinations = [];

InitializeLamps();
const numberOfHartbeatsPerHour = 3600*1000/heartbeat/4;
const numberOfHeartbeatsPerCombination = numberOfHartbeatsPerHour/allCombinations.length;

// Start the heartbeat
const intervalID = setInterval(setLamps, heartbeat);

function setLamps() {
  const currentTime = new Date();
  const second = (currentTime.getMinutes() * 60) + currentTime.getSeconds();
  
  const blinkState = (second % 2 == 1); // Start with blink ON, evaluate every second

  // Get the combination that corresponds to the current moment in time: there will fit 80 combinations in 1 hour
  const currentCombination = allCombinations[Math.floor(currentTick/numberOfHeartbeatsPerCombination)];

  // At the whole hour: Re-determine all possble combinations and shuffle them, but begin with fire-alarm
  if (second === 0) {
    InitializeLamps(); 
  } 

  // console.log('biddie', currentTick % numberOfHeartbeatsPerCombination, currentTick, numberOfHeartbeatsPerCombination);

  if (currentTick % numberOfHeartbeatsPerCombination > numberOfHeartbeatsPerCombination - 3) { // Last 1.5 seconds of a combination will be dark
    // Keep dark for a couple of seconds between every combination
    relay.setState(0, false); 
  } else if (currentCombination === '2222') { // Generally the first combination in the array
    // FireAlarm is alternating every lamp.
    relay.setState(0, false); // All off
    relay.setState(((currentTick - 1) % 4) + 1, true); // One of the 4 is on
  } else {
    lamps.forEach(lamp => {
      const currentLampState = relay.getState(lamp);
      newLampState = currentCombination[lamp-1]; // Array start with 0, lamp starts with 1
      if (newLampState === '2') {
        // Always blink
        relay.setState(lamp, blinkState);
      }
      if (newLampState === '1' && !currentLampState) {
        // The combination is active for 40 seconds or so. No need for re-setting every second
        relay.setState(lamp, true);
      } 
      if (newLampState === '0' && currentLampState) {
        relay.setState(lamp, false);
      }
    });  
  }
  currentTick++;
}

function InitializeLamps() {
  allCombinations = [];
  lampStates.forEach(lamp1 => {
    lampStates.forEach(lamp2 => {
      lampStates.forEach(lamp3 => {
        lampStates.forEach(lamp4 => {
          const lampCombination = lamp1+lamp2+lamp3+lamp4;
          // For every combination except all-off and all-blinking
          if (!['0000', '2222'].includes(lampCombination)) {
            allCombinations.push(lampCombination);
          }
        });
      });
    });  
  });
  // Shuffle it random 
  for (let i = allCombinations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCombinations[i], allCombinations[j]] = [allCombinations[j], allCombinations[i]];
  }
  // Set fire alarm as first combi
  allCombinations.unshift('2222');
  // Reset the counter, start from top
  currentTick = 0;
}

// Gracefully exit
process.on('SIGINT', function() {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  relay.setState(0, false);
  console.log("Exiting...");
  process.exit();
});
