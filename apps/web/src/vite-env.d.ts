/// <reference types="vite/client" />

declare module '@content/manifest.json' {
  import type { Manifest } from '@coderkeys/schemas';
  const manifest: Manifest;
  export default manifest;
}

declare module '@content/tracks/**/*.json' {
  import type { Lesson, TrackMeta } from '@coderkeys/schemas';
  const value: { default: Lesson | TrackMeta };
  export default value;
}
