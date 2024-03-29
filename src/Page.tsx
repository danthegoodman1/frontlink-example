import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { useSharedFunction, useSharedState } from "frontlink"

export default function Page() {
  const [count, setCount] = useSharedState("count", 0)

  const dothing = useSharedFunction("dothing", async (n: number) => {
    console.log("i am doing thing", n)
  })

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {/* <button onClick={() => setCount(count+1)}> */}
          count is {count}
        </button>
        <button onClick={() => setCount.noEmit((count) => count + 1)}>
          count is {count} (no emit)
        </button>
        <button
          onClick={() => {
            dothing(3)
          }}
        >
          do thing
        </button>
        <button
          onClick={() => {
            dothing.noEmit(3)
          }}
        >
          do thing (no emit)
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
