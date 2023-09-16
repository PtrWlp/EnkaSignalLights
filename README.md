# EnkaSignalLights
mimick the Signal lights at the old ENKA factory

sudo apt-get update
sudo apt-get install git
git clone https://github.com/PtrWlp/EnkaSignalLights.git
cd EnkaSignalLights
sudo apt-get install nodejs
sudo apt-get install npm
npm i
cp ./50-usbrelay.rules  /etc/udev/rules.d
sudo udevadm control -R
sudo usermod -a -G plugdev welp
