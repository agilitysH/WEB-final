export const apiEndpointsView = () => ({
    watchlist: [
        { method: "POST", path: "/api/watchlist", description: "Add anime to watchlist" },
        { method: "GET", path: "/api/watchlist", description: "Get user's watchlist" },
        {
            method: "PUT",
            path: "/api/watchlist/:id",
            description: "Update status, episodes watched, or score",
        },
        { method: "DELETE", path: "/api/watchlist/:id", description: "Remove anime from watchlist" },
    ],
    reviews: [
        { method: "POST", path: "/api/reviews", description: "Create review" },
        {
            method: "GET",
            path: "/api/reviews/anime/:animeId",
            description: "Get reviews for an anime",
        },
        { method: "PUT", path: "/api/reviews/:id", description: "Update review" },
        { method: "DELETE", path: "/api/reviews/:id", description: "Delete review" },
        { method: "POST", path: "/api/reviews/:id/like", description: "Like or unlike a review" },
    ],
    anime: [
        {
            method: "GET",
            path: "/api/anime/search",
            description: "Search anime by title, genre, popularity",
        },
        { method: "GET", path: "/api/anime/:animeId", description: "Get anime details by ID" },
        { method: "GET", path: "/api/anime/trending", description: "Get trending/popular anime" },
    ],
});
