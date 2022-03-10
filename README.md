<p align="left"> <img title="Alfresco" src="alfresco.png" alt="Alfresco - Simply a better way to create amazing digital experiences"></p>

# Fork of the Alfresco Content Application for MRBau

## How to build
```bash
# create/copy .env file

# optionally adapt package.json for windows environment (mdir->mkdirp /->\\ cp->copy)
npm install
npm run prebuild
npm start
```

## Documentation

[Public Alfresco Content Application documentation](https://alfresco-content-app.netlify.com/)

[ADF documentation](https://www.alfresco.com/abn/adf/docs/getting-started/)

[Create your first extension ACA 2.8.0](https://github.com/aborroy/alfresco-content-app/blob/docs/update_first_extension_tutorial/docs/tutorials/how-to-create-your-first-extension.md)
## Setting up environment variables

We need to set some environment variable to be able to run the local dev server. In the project root folder, create an `.env` file (this is gitignored) with the following data:

```bash
APP_CONFIG_ECM_HOST="https://mrdms01.mrbau.at"
APP_CONFIG_AUTH_TYPE="BASIC"

# App config settings
#APP_CONFIG_BPM_HOST="https://mrdms01.mrbau.at"
#APP_CONFIG_ECM_HOST="https://mrdms01.mrbau.at"
#APP_CONFIG_OAUTH2_HOST="https://mrdms01.mrbau.at"
#APP_CONFIG_IDENTITY_HOST="https://mrdms01.mrbau.at"
#APP_CONFIG_PROVIDER="ALL"

#APP_CONFIG_AUTH_TYPE="OAUTH"
#APP_CONFIG_OAUTH2_CLIENTID="alfresco"
#APP_CONFIG_OAUTH2_IMPLICIT_FLOW=true
#APP_CONFIG_OAUTH2_SILENT_LOGIN=true
#APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI="https://mrdms01.mrbau.at/assets/silent-refresh.html"
#APP_CONFIG_OAUTH2_REDIRECT_LOGIN=/
#APP_CONFIG_OAUTH2_REDIRECT_LOGOUT=/
# CONTENT - ALFRESCO OFFICE SERVICES PLUGIN RELATED
APP_CONFIG_PLUGIN_AOS=true
```

