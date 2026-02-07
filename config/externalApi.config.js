const jikanBaseUrl = process.env.JIKAN_API || process.env.Jikan_API;
const malBaseUrl = process.env.MAL_API;
const malClientId = process.env.MAL_CLIENT_ID;

export default {
    jikanBaseUrl,
    malBaseUrl,
    malClientId,
};
