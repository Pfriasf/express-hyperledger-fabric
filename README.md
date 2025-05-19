# Node.JS SDK 📦

This repository contains a node.js sdk for for Hyperledger fabric 2.x.

## Content

- [Node.JS SDK 📦](#nodejs-sdk-)
  - [Content](#content)
  - [Clone the project 📂](#clone-the-project-)
  - [Development 🧑🏻‍💻](#development-)
    - [Run the server](#run-the-server)
    - [Run the server with docker](#run-the-server-with-docker)
      - [Build the image 🩻](#build-the-image-)
      - [Run the container 🏃🏻🐳](#run-the-container-)
  - [API Endpoints 🔧](#api-endpoints-)
    - [Request Body](#request-body)
      - [Request body example](#request-body-example)
  - [Recommended reading 📘](#recommended-reading-)
  - [Questions and requests 🤷🏻](#questions-and-requests-)

## Clone the project 📂

```console
$ git clone "https://github.com/Pfriasf/express-hyperledger-fabric" node-sdk
$ cd node-sdk
```

## Development 🧑🏻‍💻

Install dependencies 

```javascript
$ npm install
```

### Run the server 

```javascript
$ npm run dev 
```
### Run the server with docker 

#### Build the image 🩻

```docker 
$ docker build . -t sdk
```

#### Run the container 🏃🏻🐳

```docker 
$ docker run -p 4001:4001
```
To improve the development experience, it is recommended the use of volumes 

```docker 
$ docker run -p 4001:4001 -v $PWD:/usr/src/sdk  sdk
```

## API Endpoints 🔧
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /api/invoke/ | To perform transactions that effect changes in the states of the assets in the network |
| GET | /api/query/ | To query information about the assets|

### Request Body

| Nane | Type | Required | Description |
| --- | --- | --- | --- |
| org | String | True | Organization name|
| user | String | True | User name|
| channelId | String | True | Channel name|
| contractName | String | True | Contract name|
| fcn | String | True | Chanincode method name|
| args | Object | True | Arguments required by the chaincode method|

#### Request body example
```json
{
  "org": "orgName",
  "user": "userName",
  "channelId": "channelId",
  "contractName": "contractName",
  "fcn": "functionName",
  "args":{}
}
```
🔎 For the required arguments please refer to the chaincode documentation.

