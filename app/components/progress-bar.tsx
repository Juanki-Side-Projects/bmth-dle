/*
Wanna do the breakpoints for the music playback.
First play is 2 seconds, with first skip adding 1 second and every subsequent skip adding (last skip + 1) seconds
So:
  1st play: 2s
  2nd: 3s
  3rd: 5s
  4th: 8s
  5th: 12s
  6th: 17s

  So 100% of the bar represents 17s
*/
const MAX_LENGTH = 17;

export interface Props {
  limit: number;
  isPlaying: boolean;
}

export const ProgressBar = ({ limit, isPlaying }: Props) => {
  const barLineClassName = "h-full absolute w-px border-inherit border z-10";
  const limitWidth = `${(limit / MAX_LENGTH) * 100}%`;
  return (
    // <div className="absolute w-full border-2 left-0 h-4"></div>
    <div className="border h-4 relative border-white">
      <div className={barLineClassName} style={{ left: "11.764%" }}></div>
      <div className={barLineClassName} style={{ left: "17.647%" }}></div>
      <div className={barLineClassName} style={{ left: "29.411%" }}></div>
      <div className={barLineClassName} style={{ left: "47.058%" }}></div>
      <div className={barLineClassName} style={{ left: "70.588%" }}></div>
      <div
        className="h-full absolute border-inherit bg-blue-700"
        style={{ width: limitWidth }}
      />
      <div
        id="bar"
        className="h-full bg-cyan-400 absolute left-0 transition-all ease-linear"
        style={{
          width: isPlaying ? limitWidth : 0,
          transitionDuration: isPlaying ? `${limit}s` : "0s",
        }}
      ></div>
    </div>
  );
};
