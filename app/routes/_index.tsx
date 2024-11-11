import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { promises as fs } from "fs";
import { useLoaderData } from "@remix-run/react";
import { TrackInput } from "~/components/track-input";
import { GuessAttempts } from "~/components/attempts";
const MAX_TRIES = 6;

export const meta: MetaFunction = () => {
  return [
    { title: "BMTHdle" },
    { name: "description", content: "Bring me the Horizon daily game" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const fileContents = await fs.readFile(
    new URL("../static/tracks.json", import.meta.url),
    { encoding: "utf-8" }
  );

  const data = JSON.parse(fileContents);

  const idx = Math.floor(Math.random() * data.tracks.length - 1);
  const trackId = data.tracks[idx];

  return { trackId };
}

const play = (embedController: any) => {
  embedController.restart();
};

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
      };
      const callback = (EmbedController) => {
        setEmbedController(EmbedController);
        EmbedController.addListener("playback_update", (e) => {
          const newProgress = parseInt(e.data.position / 1000, 10);
          setProgress(newProgress);
        });
      };
      IFrameAPI.createController(element, options, callback);
    };
  }, [trackId]);

  useEffect(() => {
    if (progress === limit && embedController) {
      embedController.pause();
    }
  }, [progress, limit, embedController]);

  return (
    <div className="font-sans text-white bg-black">
      <header className="w-full h-10 text-xl flex justify-center border-solid border-b border-white">
        BMTHdle
      </header>
      <div id="content" className="flex flex-col items-center px-10">
        <GuessAttempts />
        <p>{progress}</p>
        <div>
          <div id="embed-iframe" className="hidden"></div>
        </div>
        <button
          disabled={!embedController}
          onClick={() => {
            play(embedController);
          }}
        >
          Play
        </button>
        <TrackInput />
        <div id="attempt-actions" className="flex mt-3 w-80 justify-between">
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
        <p>Limit: {limit} seconds</p>
      </div>
    </div>
  );
}
