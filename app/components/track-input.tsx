import { useState } from "react";
import { tracks } from "~/static/tracks";

const TRACKS_SHOWN = 10;

export interface Props {
  selectedTrackId: string | null;
  setSelectedTrackId: (t: string | null) => void;
  trackText: string;
  setTrackText: (t: string) => void;
}

export const TrackInput = ({
  selectedTrackId,
  setSelectedTrackId,
  trackText,
  setTrackText,
}: Props) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div id="dropdown-container" className="relative">
      <input
        className="w-full h-10 border-2 leading-tight bg-inherit px-2"
        type="text"
        id="track"
        value={trackText}
        onChange={(e) => {
          setTrackText(e.target.value);
        }}
        onFocus={() => {
          setShowOptions(true);
        }}
        onBlur={() => {
          setShowOptions(false);
        }}
        placeholder="Search for the song"
      />
      {showOptions && trackText.length > 0 ? (
        <Options
          trackText={trackText}
          setTrackText={setTrackText}
          setSelectedTrackId={setSelectedTrackId}
          selectedTrackId={selectedTrackId}
        />
      ) : null}
      {/* <Options
        trackText={trackText}
        setTrackText={setTrackText}
        setSelectedTrackId={setSelectedTrackId}
        selectedTrackId={selectedTrackId}
      /> */}
    </div>
  );
};

type OptionProps = Props & {
  trackText: string;
  setTrackText: (s: string) => void;
};

const escapeText = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const Options = ({
  trackText,
  setSelectedTrackId,
  setTrackText,
}: OptionProps) => {
  const regex = new RegExp(`.*${escapeText(trackText)}.*`, "i");

  const filteredTracks = tracks
    .filter(({ name }) => regex.test(name))
    .slice(0, TRACKS_SHOWN);
  return filteredTracks.length > 0 ? (
    <div className="border-2 bg-black absolute bottom-full w-full">
      {filteredTracks.map(({ name, id }) => {
        return (
          <button
            onMouseDown={() => {
              setSelectedTrackId(id);
              setTrackText(name);
            }}
            key={id}
            className="w-full h-8 border-2 flex items-center bg-inherit whitespace-nowrap overflow-x-scroll"
          >
            {name}
          </button>
        );
      })}
    </div>
  ) : null;
};
