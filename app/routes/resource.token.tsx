import { json } from "@remix-run/node";

const getAccessToken = async (): string => {
  console.log(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`,
    });

    const data = await res.json();

    console.log(data);

    return data.access_token;
  } catch (err) {
    console.error(err);
    throw Error("Error getting access token");
  }
};

export async function loader() {
  const token = await getAccessToken();

  return json({ token });
}
