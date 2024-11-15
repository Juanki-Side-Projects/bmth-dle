import { tracks } from "~/static/tracks";
import { ReactNode } from "react";
const TOTAL_TRIES = 6;

export interface Props {
  previousTrackIds: string[];
}

interface AttemptProps {
  children?: ReactNode;
}

const Attempt = ({ children }: AttemptProps) => (
  <div className="min-w-96 h-10 mb-2 border-2 border-blue-500 my-5 px-1 flex items-center">
    {children}
  </div>
);

const renderAttempts = (prevAttempts: string[]) => {
  const attempts = [];
  for (let i = 0; i < prevAttempts.length; i++) {
    const attempt = prevAttempts[i];
    if (attempt === "") {
      attempts.push(
        <Attempt key={i}>
          <span className="text-gray-500">Skipped</span>
        </Attempt>
      );
    } else {
      const track = tracks.find((track) => track.id == attempt);
      if (track) {
        attempts.push(<Attempt key={track.id}>{track.name}</Attempt>);
      }
    }
  }
  for (let i = 0; i < TOTAL_TRIES - prevAttempts.length; i++) {
    attempts.push(<Attempt key={prevAttempts.length + i} />);
  }
  return attempts;
};

export const GuessAttempts = ({ previousTrackIds }: Props) => {
  return <div id="attempts">{renderAttempts(previousTrackIds)}</div>;
};
