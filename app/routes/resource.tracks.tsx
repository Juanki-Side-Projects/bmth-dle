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

const getAllTracksFromAlbum = async (albumId: string): Promise<string[]> => {
  let offset = 0;

  const allTrackIds = [];

  let { items, next } = await getArtistTracks(albumId);

  for (const item of items) {
    allTrackIds.push(item.id);
  }

  while (next) {
    offset += MAX_RETURN;

    const tracks = await getArtistTracks(albumId, offset);

    items = tracks.items;

    for (const item of items) {
      allTrackIds.push(item.id);
    }

    next = tracks.next;
  }

  return allTrackIds;
};

const getAllArtistTrackIds = async () => {
  const albumIds = await getAllArtistAlbumIds();

  console.log("ALL ALBUM IDS", albumIds);

  let tracks: string[] = [];

  for (const albumId of albumIds) {
    const albumTracks = await getAllTracksFromAlbum(albumId);
    console.log(`TRACKS FROM ALBUM ${albumId}`, albumTracks);
    console.log(`${tracks.length} tracks now`);
    tracks = tracks.concat(albumTracks);
  }

  console.log(`FINAL TRACKS`, tracks, `TRACK COUNT: ${tracks.length}`);
  return tracks;
};
export async function loader() {
  const tracks = await getAllArtistTrackIds();

  return json({ tracks });
}
