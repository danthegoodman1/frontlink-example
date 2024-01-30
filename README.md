# Frontlink example

Example for [frontlink](https://github.com/danthegoodman1/frontlink).

## Frontend

See [App.tsx](src/App.tsx) and [Page.tsx](src/Page.tsx) (open console to see function firing).

## Backend

A simple express server with websocket support in [index.ts](index.ts). This has basic room management (in memory), and handles unexpected and graceful client disconnects. It does not implement presence notifications (emitting `Roommate(Un)Subscribed` events), but comments where it would.
