# EnkaSignalLights
mimick the Signal lights at the old ENKA factory

sudo apt-get update
sudo apt-get install git
git clone https://github.com/PtrWlp/EnkaSignalLights.git
cd EnkaSignalLights
sudo apt-get install nodejs
sudo apt-get install npm
npm i

// Set the rights to the hardware
cp ./50-usbrelay.rules  /etc/udev/rules.d
sudo udevadm control -R


// Register the app as a systemd service
sudo cp ./enka-signal-lights.service /etc/systemd/system

// To start manually, run sudo systemctl start enka-signal-lights.service
To stop the service, run sudo systemctl stop enka-signal-lights
