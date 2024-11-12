import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { promises as fs } from "fs";
import { useLoaderData } from "@remix-run/react";
import { TrackInput } from "~/components/track-input";
import { GuessAttempts } from "~/components/attempts";
import { ProgressBar } from "~/components/progress-bar";
const MAX_TRIES = 6;

export const meta: MetaFunction = () => {
  return [
    { title: "BMTHdle" },
    { name: "description", content: "Bring me the Horizon daily game" },
  ];
};

export async function loader() {
  const fileContents = await fs.readFile(
    new URL("../static/tracks.json", import.meta.url),
    { encoding: "utf-8" }
  );

  const data = JSON.parse(fileContents);

  const idx = Math.floor(Math.random() * data.tracks.length - 1);
  const trackId = data.tracks[idx];

  return { trackId };
}

const useScript = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
  }, []);
};

export default function Index() {
  const { trackId } = useLoaderData<typeof loader>();
  const [tries, setTries] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [embedController, setEmbedController] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [limit, setLimit] = useState(2);
  const [skip, setSkip] = useState(1);
  useScript();

  useEffect(() => {
    if (!trackId) {
      return;
    }
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById("embed-iframe");
      const options = {
        uri: `spotify:track:${trackId}`,
        width: 0,
        height: 0,
      };
      const callback = (EmbedController) => {
        setEmbedController(EmbedController);
        EmbedController.addListener("playback_update", (e) => {
          const newProgress = parseInt(e.data.position / 1000, 10);
          setIsPlaying(!e.data.isPaused);
          setProgress(newProgress);
        });
      };
      IFrameAPI.createController(element, options, callback);
    };
  }, [trackId]);

  useEffect(() => {
    if (progress === limit && embedController) {
      console.log(progress, limit);
      // setTimeout(() => {
      //   embedController.pause();
      //   setProgress(0);
      // }, 150);
      embedController.pause();
      setProgress(0);
    }
  }, [progress, limit, embedController]);

  return (
    <div className="font-sans text-white">
      <header className="w-full h-10 text-xl flex justify-center border-solid border-b border-white">
        BMTHdle
      </header>
      <div id="content" className="max-w-screen-sm mx-auto">
        <GuessAttempts />
        <p>{progress}</p>
        <ProgressBar progress={progress} limit={limit} isPlaying={isPlaying} />
        <div id="embed-iframe"></div>
        <div className="flex justify-center my-4">
          {isPlaying ? (
            <button
              onClick={() => {
                if (embedController) {
                  embedController.pause();
                }
              }}
            >
              <PauseButton />
            </button>
          ) : (
            <button
              disabled={!embedController}
              onClick={() => {
                if (embedController) {
                  embedController.restart();
                }
              }}
            >
              <PlayButton />
            </button>
          )}
        </div>
        <div className="w-full mx-auto">
          <TrackInput
            setSelectedTrackId={setSelectedTrackId}
            selectedTrackId={selectedTrackId}
          />
          <div id="attempt-actions" className="flex mt-3 justify-between">
            <button
              id="skip"
              className="rounded-md min-w-16 border-1 bg-blue-700 p-2"
              disabled={skip > 5}
              onClick={() => {
                setLimit(limit + skip);
                setSkip(skip + 1);
              }}
            >
              Skip (+{skip}s)
            </button>
            <button
              id="submit"
              className="rounded-md min-w-16 border-1 bg-pink-300 p-2"
              disabled={tries == MAX_TRIES}
              onClick={() => {}}
            >
              Submit
            </button>
          </div>
        </div>
        <p>Limit: {limit} seconds</p>
      </div>
    </div>
  );
}

const PlayButton = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="75px"
    viewBox="0 -960 960 960"
    width="75px"
    fill="#e8eaed"
  >
    <path d="m401.46-341.54 217-138.46-217-138.46v276.92ZM480.13-120q-74.44 0-139.79-28.34t-114.48-77.42q-49.13-49.08-77.49-114.37Q120-405.42 120-479.87q0-74.67 28.34-140.41 28.34-65.73 77.42-114.36 49.08-48.63 114.37-76.99Q405.42-840 479.87-840q74.67 0 140.41 28.34 65.73 28.34 114.36 76.92 48.63 48.58 76.99 114.26Q840-554.81 840-480.13q0 74.44-28.34 139.79t-76.92 114.48q-48.58 49.13-114.26 77.49Q554.81-120 480.13-120Zm-.13-30.77q137.38 0 233.31-96.04 95.92-96.04 95.92-233.19 0-137.38-95.92-233.31-95.93-95.92-233.31-95.92-137.15 0-233.19 95.92-96.04 95.93-96.04 233.31 0 137.15 96.04 233.19 96.04 96.04 233.19 96.04ZM480-480Z" />
  </svg>
);

const PauseButton = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="75px"
    viewBox="0 -960 960 960"
    width="75px"
    fill="#e8eaed"
  >
    <path d="M396.92-340h30.77v-280h-30.77v280Zm135.39 0h30.77v-280h-30.77v280Zm-52.18 220q-74.44 0-139.79-28.34t-114.48-77.42q-49.13-49.08-77.49-114.37Q120-405.42 120-479.87q0-74.67 28.34-140.41 28.34-65.73 77.42-114.36 49.08-48.63 114.37-76.99Q405.42-840 479.87-840q74.67 0 140.41 28.34 65.73 28.34 114.36 76.92 48.63 48.58 76.99 114.26Q840-554.81 840-480.13q0 74.44-28.34 139.79t-76.92 114.48q-48.58 49.13-114.26 77.49Q554.81-120 480.13-120Zm-.13-30.77q137.38 0 233.31-96.04 95.92-96.04 95.92-233.19 0-137.38-95.92-233.31-95.93-95.92-233.31-95.92-137.15 0-233.19 95.92-96.04 95.93-96.04 233.31 0 137.15 96.04 233.19 96.04 96.04 233.19 96.04ZM480-480Z" />
  </svg>
);
