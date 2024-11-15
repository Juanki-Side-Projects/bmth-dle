import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { TrackInput } from "~/components/track-input";
import { GuessAttempts } from "~/components/attempts";
import { ProgressBar } from "~/components/progress-bar";
import { trackIds } from "~/static/trackIds";
const MAX_TRIES = 6;

export const meta: MetaFunction = () => {
  return [
    { title: "BMTHdle" },
    { name: "description", content: "Bring me the Horizon daily game" },
  ];
};

export async function loader() {
  const idx = Math.floor(Math.random() * trackIds.length - 1);
  const trackId = trackIds[idx];

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

export enum GAME_STATE {
  PLAYING,
  WIN,
  LOSE,
}

export default function Index() {
  const { trackId } = useLoaderData<typeof loader>();
  const [gameState, setGameState] = useState(GAME_STATE.PLAYING);
  const [tries, setTries] = useState(1);
  const [previousTrackIds, setPreviousTrackIds] = useState<string[]>([]);
  const [trackText, setTrackText] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
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
        // width: 0,
        // height: 0,
      };
      const callback = (EmbedController) => {
        setEmbedController(EmbedController);
        EmbedController.addListener("playback_update", (e) => {
          const newProgress = Math.round(e.data.position / 1000);
          // const newProgress = parseInt(e.data.position / 1000, 10);
          console.log(e.data.position, newProgress);
          setProgress(newProgress);
          setIsPlaying(!e.data.isPaused);
        });
      };
      IFrameAPI.createController(element, options, callback);
    };
  }, [trackId]);

  // Pause music if song gets to the limit
  useEffect(() => {
    if (progress >= limit && embedController) {
      embedController.pause();
      setTimeout(() => {
        setProgress(0);
      }, 100);
    }
  }, [progress, limit, embedController]);

  if ([GAME_STATE.WIN, GAME_STATE.LOSE].includes(gameState)) {
    return (
      <GameEndScreen gameState={gameState} tries={tries} trackId={trackId} />
    );
  }

  return (
    <div className="font-sans text-white">
      <header className="w-full h-10 text-xl flex justify-center border-solid border-b border-white">
        BMTHdle
      </header>
      <div id="content" className="max-w-screen-sm mx-auto">
        <GuessAttempts previousTrackIds={previousTrackIds} />
        <br />
        <ProgressBar progress={progress} limit={limit} isPlaying={isPlaying} />
        <div id="embed-iframe"></div>
        <div className="flex items-center justify-between my-4">
          <span>{`0:${progress < 10 ? "0" : ""}${progress}`}</span>
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
          <span>0:17</span>
        </div>
        <div className="w-full mx-auto">
          <TrackInput
            setSelectedTrackId={setSelectedTrackId}
            selectedTrackId={selectedTrackId}
            trackText={trackText}
            setTrackText={setTrackText}
          />
          <div id="attempt-actions" className="flex mt-3 justify-between">
            <button
              id="skip"
              className="rounded-md min-w-16 border-1 bg-blue-700 p-2"
              disabled={tries > 6}
              onClick={() => {
                const newTries = tries + 1;
                if (newTries > 6) {
                  setGameState(GAME_STATE.LOSE);
                }
                setLimit(limit + skip);
                setSkip(skip + 1);
                setTries(newTries);
                setPreviousTrackIds([...previousTrackIds, ""]);
              }}
            >
              Skip (+{skip}s)
            </button>
            <button
              id="submit"
              className="rounded-md min-w-16 border-1 bg-pink-300 p-2"
              disabled={!selectedTrackId}
              onClick={() => {
                if (
                  !selectedTrackId ||
                  previousTrackIds.includes(selectedTrackId)
                ) {
                  return;
                }

                if (selectedTrackId === trackId) {
                  setGameState(GAME_STATE.WIN);
                } else {
                  if (tries === MAX_TRIES) {
                    setGameState(GAME_STATE.LOSE);
                  } else {
                    setPreviousTrackIds([...previousTrackIds, selectedTrackId]);
                    setTries(tries + 1);
                    setLimit(limit + skip);
                    setSkip(skip + 1);
                  }
                }
                setTrackText("");
                setSelectedTrackId(null);
              }}
            >
              Submit
            </button>
          </div>
        </div>
        <p>Limit: {limit} seconds</p>
        <p>Tries: {tries}</p>
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

interface GameEndScreenProps {
  tries: number;
  gameState: GAME_STATE;
  trackId: string;
}

const GameEndScreen = ({ gameState, tries, trackId }: GameEndScreenProps) => {
  return (
    <div className="text-white w-full flex flex-col items-center my-10">
      <p className="text-4xl my-5">
        {gameState === GAME_STATE.WIN
          ? `Congrats! You got it in ${tries} ${tries == 1 ? "try" : "tries"}.`
          : `Nice try!`}
      </p>
      <p className="my-5">The song was: </p>
      <iframe
        title="end-game-embed"
        style={{ borderRadius: 12, width: 500, height: 300 }}
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};
