# Simple Web Client

A starter template using a simple web framework for TypeScript projects.

## Development Features

The following features are available using TypeScript, Prettier, and Docker.

- File change detection with automatic browser reload (`npm start`)
- Application bundling (`npm run build`)
  - `env.build.ts` will automatically replace `env.ts`
- HTTPS
  - A `server.crt` and `server.key` file must be provided at `.simple-web-client/nginx/certs/`
  - You will need to import the `server.crt` file to your browser's trusted certs.
