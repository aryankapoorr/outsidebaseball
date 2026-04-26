import { useState, useEffect } from 'react';
import { getPlayerHeadshot } from '../../utils/mlbLookup';

/**
 * Displays a face-cropped pitcher headshot from the MLB CDN.
 *
 * The source images are 360×541 portrait (head-to-waist). To show only the
 * face/head area, the image is rendered at 2× the container width and clipped
 * — this shows the top ~40% of the image where the face sits.
 */
export default function PlayerAvatar({ csvName, className = '', style = {} }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPlayerHeadshot(csvName).then((resolved) => {
      if (!cancelled) setUrl(resolved);
    });
    return () => { cancelled = true; };
  }, [csvName]);

  // Outer div clips to the face region; inner img is 200% wide so only the
  // top ~40% of the tall portrait is visible, with the face centered.
  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 rounded-sm bg-gray-800 ${className}`}
      style={{ width: 40, height: 52, ...style }}
    >
      {url ? (
        <img
          src={url}
          alt=""
          style={{
            position: 'absolute',
            width: '200%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-gray-700" />
      )}
    </div>
  );
}
