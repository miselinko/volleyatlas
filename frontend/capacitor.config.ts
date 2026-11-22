import type { CapacitorConfig } from '@capacitor/cli';
const dev=process.env.CAP_DEV==='1';
const config:CapacitorConfig={appId:'rs.volleyatlas.app',appName:'VolleyAtlas',webDir:'dist',android:{allowMixedContent:dev},server:{cleartext:dev}};
export default config;
