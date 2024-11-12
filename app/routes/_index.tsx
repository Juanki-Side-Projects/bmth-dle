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
        <button
          disabled={!embedController}
          onClick={() => {
            if (embedController) {
              embedController.restart();
            }
          }}
        >
          Play
        </button>
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
