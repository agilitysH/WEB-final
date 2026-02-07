export const reviewItemView = (item) => ({
    id: item._id,
    user: item.user,
    animeId: item.animeId,
    reviewText: item.reviewText,
    rating: item.rating,
    likes: item.likes,
    likesCount: item.likes?.length ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const reviewListView = (items) => items.map(reviewItemView);
