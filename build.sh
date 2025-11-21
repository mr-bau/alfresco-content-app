#!/bin/bash
# Script for building the Docker image 'mrbau/alfresco-content-app:latest'
#
# Usage: ./build.sh [Option]
#   Option: --no-cache or no-cache (optional)
#           Adds the '--no-cache' option to the 'docker build' command.

# Define the image name and tag
IMAGE_TAG="mrbau/alfresco-content-app:latest"

# Base command
DOCKER_CMD="docker build -t $IMAGE_TAG ."

# Check if the argument '--no-cache' or 'no-cache' was passed
if [[ "$1" == "--no-cache" || "$1" == "no-cache" ]]; then
    echo "--- Building Docker image with --no-cache ---"
    # Add the --no-cache flag to the command
    DOCKER_CMD="docker build --no-cache -t $IMAGE_TAG ."
else
    echo "--- Building Docker image using cache ---"
fi

# Execute the command
echo "Executing: $DOCKER_CMD"
$DOCKER_CMD

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "--- Docker Image '$IMAGE_TAG' successfully built. ---"
else
    echo "--- ERROR: Docker Image build failed. ---"
    exit 1
fi
