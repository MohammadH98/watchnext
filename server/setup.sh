#!/bin/bash

sleep 2 && node server.js &

./ngrok http 2000;

