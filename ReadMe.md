### CIQ-BMS

#### Technology 📶
* Backend: NodeJS v14.15
* Database: Postgers v13

#### Installation 💻

* Install [docker](https://docs.docker.com/get-docker/)
* Install [nvm](https://github.com/nvm-sh/nvm) (_if you have already nvm change node version to 14.15.0_)
* Install node version

```
nvm install 14.15.0
```

* Install packages.

```
cd ciq-bms
npm install
```

#### How to run server? 🏃

```
npm start
```

#### Quick Run? ⏰

* Make sure you have install [docker](https://docs.docker.com/get-docker/) to your machine.

* To install postgres
```
sudo docker run --rm -p 5432:5432 --name ciq-postgres -e POSTGRES_PASSWORD=Abc@123 -d postgres:13
```
* To build and run backend server
```
sudo docker build . -t ciq
sudo docker run --rm --name ciq-backend --network="host" -d ciq
```

#### Documentation 🎓

* Documentation for this can be found at [docs](https://docs.google.com/document/d/1_Q7g6T5CR5mWqCX7Mt78o8z6nhKl5xM2CkvgfXGyoQU/edit?usp=sharing)