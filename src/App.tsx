import "./App.css"
import { FrontlinkProvider } from "frontlink"
import Page from "./Page"

function App() {
  return (
    <FrontlinkProvider api="ws://localhost:8080/ws">
      <Page />
    </FrontlinkProvider>
  )
}

export default App
