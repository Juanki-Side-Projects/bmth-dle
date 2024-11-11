import { type Track } from "~/types/tracks";
const TOTAL_TRIES = 6;

const renderAttempts = (prevAttempts) => {
  const attempts = [];
  for (let i = 0; i < TOTAL_TRIES; i++) {
    attempts.push(
      <div
        className="min-w-96 h-10 border-2 border-blue-500 my-5 px-1 flex items-center"
        key={i}
      ></div>
    );
  }
  return attempts;
};

export const GuessAttempts = () => {
  return <div id="attempts">{renderAttempts([])}</div>;
};
