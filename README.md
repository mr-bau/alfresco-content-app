<p align="left"> <img title="Alfresco" src="alfresco.png" alt="Alfresco - Simply a better way to create amazing digital experiences"></p>

# Fork of the Alfresco Content Application for MRBau

## Requirements

| Name | Version |
| --- | --- |
| Node.js | 14.x |
| Npm | 6.x |

## How to build (Docker)

In order to deploy the customisations of this project within the context of the [M&R Bau Alfresco deployment template](https://github.com/mr-bau/alfresco-deployment), a Docker image must be built. This can be done without having Node / NPM installed locally by moving the build inside the Docker build pipeline. The build of the Docker image can be triggered by executing the following command:

```
docker build -t mrbau/alfresco-content-app:latest .
```

This build only requires that the Docker container engine is installed and running locally, as well that access to the central Docker hub (hub.docker.io) is allowed to pull the underyling base image(s).

## Running

Create an `.env` file in the project root folder with the following content

```yml
APP_CONFIG_ECM_HOST="<URL>"
APP_CONFIG_PLUGIN_AOS=false
APP_CONFIG_PLUGIN_CONTENT_SERVICE=true
APP_CONFIG_PLUGIN_FOLDER_RULES=true
```

Where `<URL>` is the address of the ACS.

Run the following commands:

```sh
npm install
npm start content-ce
```

### Using Local ADF

Clone the `alfresco-ng2-components` and `alfresco-content-app` repositories in the same folder, and run the following command:

```sh
npm start content-ce -- --configuration=adf
```

Changing the ADF code results in the recompilation and hot-reloading of the ACA application.

## See Also

Please refer to the [Public documentation](https://alfresco-content-app.netlify.com/) for more details
