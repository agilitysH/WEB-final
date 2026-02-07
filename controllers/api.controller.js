import { apiEndpointsView } from "../view/apiEndpoints.view.js";

export const getApiEndpointList = (req, res) => {
    res.json(apiEndpointsView());
};
