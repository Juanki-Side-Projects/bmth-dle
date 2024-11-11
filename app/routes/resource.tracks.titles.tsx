import { json } from "@remix-run/node";

//https://open.spotify.com/artist/1Ffb6ejR6Fe5IamqA5oRUF?si=rJaPzkidQ4CPhOpzXScDrA
const BMTH_ID = "1Ffb6ejR6Fe5IamqA5oRUF";
const DEFAULT_RETURN = 20;
const MAX_RETURN = 50;
const TOKEN =
  "BQDH6iEi0qVYgqjvH9ZdbwmA-ZDGbB5GdNPHiLuOlhPvzIvUp0SZF18INNruilmGp9PRrZ-GoD8gQ1aDDm532CM6YffOi9gmYpzIF4OfgC1V9jAktIQ";
const getArtistAlbums = async (offset: number = 0) => {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${BMTH_ID}/albums?offset=${offset}&limit=${MAX_RETURN}&locale=*&include_groups=album,single`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    return await res.json();
  } catch (err) {
    console.error("Error getting artist albums", err);
  }
};

const getAllArtistAlbumIds = async () => {
  let offset = 0;

  const allAlbumIds = [];

  let albums = await getArtistAlbums();

  let { items, next } = albums;

  for (const item of items) {
    allAlbumIds.push(item.id);
  }

  while (next) {
    offset += MAX_RETURN;

    albums = await getArtistAlbums(offset);

    items = albums.items;

    for (const item of items) {
      allAlbumIds.push(item.id);
    }

    next = albums.next;
  }

  return allAlbumIds;
};

const getArtistTracks = async (albumId: string, offset: number = 0) => {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?offset=${offset}&limit=${MAX_RETURN}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    return await res.json();
  } catch (err) {
    console.error("Error getting artist tracks", err);
  }
};

const getAllTracksFromAlbum = async (albumId: string): Promise<any[]> => {
  let offset = 0;

  const allTracks = [];

  let { items, next } = await getArtistTracks(albumId);

  for (const item of items) {
    const { artists, id, name } = item;
    const artistNames = artists.map((artist) => {
      return artist.name;
    });
    allTracks.push({ artists: artistNames, id, name });
  }

  while (next) {
    offset += MAX_RETURN;

    const tracks = await getArtistTracks(albumId, offset);

    items = tracks.items;

    for (const item of items) {
      const { artists, id, name } = item;
      allTracks.push({ artists, id, name });
    }

    next = tracks.next;
  }

  return allTracks;
};

const getAllArtistTracks = async () => {
  const albumIds = await getAllArtistAlbumIds();

  let tracks: string[] = [];

  for (const albumId of albumIds) {
    const albumTracks = await getAllTracksFromAlbum(albumId);
    tracks = tracks.concat(albumTracks);
  }

  return tracks;
};
export async function loader() {
  const tracks = await getAllArtistTracks();

  return json({ tracks });
}
