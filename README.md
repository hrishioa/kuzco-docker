# Kuzco Runner and Dockerfile

This repo contains (along with some old experiments) the runner for [Kuzco](https://kuzco.xyz) as well as a Dockerfile you can compile to make it easier to run the current version of Kuzco.

The key task of the runner is to listen to output with a timeout, to extend the timeout if inference signs are detected, and to restart the worker if nothing happens within the timeout. The docker container uses nvidia-11.8 as a base image (12.0 has some issues), and installs Kuzco as well as bun to execute the workers.

[Here is a full guide](https://olickel.com/kuzco-quickstart) on how to use the containers.
