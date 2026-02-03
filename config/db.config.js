export default {
    HOST: "localhost",
    PORT: 27017,
    DB: process.env.MONGO_URI || "node_js_jwt_auth_db",
};
