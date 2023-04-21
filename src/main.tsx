import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, localStorageManager } from "@chakra-ui/react";

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./services/cashu";
import createTheme from "./theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider
      theme={createTheme("#91338c")}
      colorModeManager={localStorageManager}
    >
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
