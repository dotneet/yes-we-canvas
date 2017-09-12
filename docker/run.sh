#!/bin/bash

docker run -ti -d --name yes-we-canvas -p 8100:8100
           --shm-size=1024m \
           --cap-add=SYS_ADMIN \
           ywc 
