import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, localStorageManager } from "@chakra-ui/react";

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";

import createTheme from "./theme";
import AuthProvider from "./AuthProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider
    theme={createTheme("#91338c")}
    colorModeManager={localStorageManager}
  >
    <AuthProvider>
      <App />
    </AuthProvider>
  </ChakraProvider>,
);
