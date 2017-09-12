#!/bin/bash -ue

docker build -f Dockerfile_ffmpeg --label ffmpeg -t ffmpeg .
docker build -f Dockerfile_chrome --label chrome -t chrome .
docker build -f Dockerfile_node --label node -t node .
docker build -f Dockerfile_ywc --label ywc -t ywc .

