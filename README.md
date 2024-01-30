# Frontlink example

Example for [frontlink](https://github.com/danthegoodman1/frontlink).

## Running

First:

```
https://github.com/danthegoodman1/frontlink-example
cd frontlink-example
npm i
```

In one terminal:

```
npm run dev
```

In another:

```
npm run server
```

Then load 2 browser instances and watch state updates reflect on each client, and look at the console to see the function call from one client trigger in the other!

## Frontend

See [App.tsx](src/App.tsx) and [Page.tsx](src/Page.tsx) (open console to see function firing).

## Backend

A simple express server with websocket support in [index.ts](index.ts). This has basic room management (in memory), and handles unexpected and graceful client disconnects. It does not implement presence notifications (emitting `Roommate(Un)Subscribed` events), but comments where it would.
