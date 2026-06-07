import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Tabata Timer — Free Fullscreen Interval & HIIT Timer' },
      {
        name: 'description',
        content:
          'A free, minimalist fullscreen interval timer for Tabata, HIIT and workouts. Big countdown numbers, themes and audio cues — no signup.',
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
})
