import { MantineProvider, Text } from "@mantine/core";
import HomePage from "./pages";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    console.log("App mounted");
    const api_url = localStorage.getItem("api_url");

    if (
      api_url == null ||
      api_url == undefined ||
      api_url == "" ||
      api_url == "null" ||
      api_url == "undefined"
    ) {
      while (true) {
        const url = prompt("Enter API URL", "");
        if (url) {
          localStorage.setItem("api_url", url);
          break;
        }
      }
    }
  }, []);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <HomePage />
    </MantineProvider>
  );
}
