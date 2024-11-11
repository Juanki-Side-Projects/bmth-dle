//https://open.spotify.com/artist/1Ffb6ejR6Fe5IamqA5oRUF?si=rJaPzkidQ4CPhOpzXScDrA
const BMTH_ID = "1Ffb6ejR6Fe5IamqA5oRUF";

const getAccessToken = async () => {
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`,
    });

    const data = await res.json();

    return data.access_token;
  } catch (err) {
    console.error("Error getting access token", err);
  }
};

const getArtistAlbums = async (token: string) => {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${BMTH_ID}/albums`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    console.error("Error getting artist albums", err);
  }
};

console.log(getAccessToken);
