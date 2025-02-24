import { useState, useEffect, memo } from "react";
import type { FileInfo } from "../../hooks/storage";

import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

type Props = {
  file: FileInfo;
  duration: number;
  complete: (id: string) => void;
};

const interval = 200;

export const Uploading = memo(_Uploading);
function _Uploading({ file, duration, complete }: Props) {
  const step = interval / duration;
  const [t, setT] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (file.status === "uploading") {
      interval = setInterval(() => {
        setT((value) => (value >= 1 ? 0 : value + step));
      }, 200);
    } else {
      setTimeout(() => {
        setT(1);
      }, 200);
      setTimeout(() => {
        complete(file.id);
      }, 1000);
    }

    return () => interval && clearInterval(interval);
  }, [file.id, file.status, step, complete]);

  const progress = Math.floor((1 - (1 - t) ** 4) * 100);

  return (
    <Card.Root width="full">
      <Card.Header>
        <Card.Title>{file.name}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Progress value={progress < 100 ? progress : 99} min={0} max={100} />
      </Card.Body>
    </Card.Root>
  );
}
