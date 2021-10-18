import apiConfig from './api-config';

const { host, port } = apiConfig;

export const getBaseApiUrl = () => {
    if (!!host && !!port) {
        return `http://${host}:${port}`;
    }

    return '';
};
