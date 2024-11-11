import { useState } from "react";
import { tracks } from "~/static/tracks";

const TRACKS_SHOWN = 10;

export const TrackInput = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackText, setTrackText] = useState("");
  return (
    <div>
      <input type="text" id="trackId" className="hidden" aria-hidden="true" />
      <input
        className="w-80 h-10 border-2 leading-tight"
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
        <Options trackText={trackText} />
      ) : null}
      {/* <Options trackText={trackText} /> */}
    </div>
  );
};

export const Options = ({ trackText }) => {
  const regex = new RegExp(`.*${trackText}.*`, "i");

  const filteredTracks = tracks
    .filter(({ name }) => regex.test(name))
    .slice(0, TRACKS_SHOWN);
  return (
    <div className="w-80 h-12 border-2" style={{ lineHeight: "100%" }}>
      {filteredTracks.map(({ name, artists, id }) => {
        return (
          <span key={id} className="w-full h-full border-2 flex items-center">
            {name +
              (artists.length > 1 ? ` ft. ${artists.slice(1).join(", ")}` : "")}
          </span>
        );
      })}
    </div>
  );
};
