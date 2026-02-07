export const watchlistItemView = (item) => ({
    id: item._id,
    user: item.user,
    animeId: item.animeId,
    title: item.title,
    status: item.status,
    episodesWatched: item.episodesWatched,
    score: item.score,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const watchlistListView = (items) => items.map(watchlistItemView);
