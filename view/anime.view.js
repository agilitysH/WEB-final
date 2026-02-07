const mapJikanListItem = (item) => ({
    id: item.mal_id,
    title: item.title,
    type: item.type,
    episodes: item.episodes,
    score: item.score,
    year: item.year,
    image: item.images?.jpg?.image_url,
});

const mapMalListItem = (item) => ({
    id: item.node?.id,
    title: item.node?.title,
    image: item.node?.main_picture?.medium || item.node?.main_picture?.large,
});

const mapJikanDetails = (data) => ({
    id: data.mal_id,
    title: data.title,
    synopsis: data.synopsis,
    type: data.type,
    episodes: data.episodes,
    status: data.status,
    score: data.score,
    year: data.year,
    genres: data.genres?.map((genre) => genre.name),
    image: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
});

const mapMalDetails = (data) => ({
    id: data.id,
    title: data.title,
    synopsis: data.synopsis,
    mean: data.mean,
    status: data.status,
    numEpisodes: data.num_episodes,
    genres: data.genres?.map((genre) => genre.name),
    image: data.main_picture?.large || data.main_picture?.medium,
});

export const animeSearchView = ({ provider, data }) => {
    if (provider === "mal") {
        return {
            provider,
            results: data?.data?.map(mapMalListItem) ?? [],
        };
    }

    return {
        provider,
        results: data?.data?.map(mapJikanListItem) ?? [],
    };
};

export const animeDetailsView = ({ provider, data }) => {
    if (provider === "mal") {
        return {
            provider,
            result: mapMalDetails(data),
        };
    }

    return {
        provider,
        result: mapJikanDetails(data?.data ?? {}),
    };
};

export const animeTrendingView = ({ provider, data }) => {
    if (provider === "mal") {
        return {
            provider,
            results: data?.data?.map(mapMalListItem) ?? [],
        };
    }

    return {
        provider,
        results: data?.data?.map(mapJikanListItem) ?? [],
    };
};
