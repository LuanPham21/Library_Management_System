import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";

import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#d4a843",

          colorBgBase: "#0c0c10",
          colorBgContainer: "#13131a",

          colorText: "#ede9e0",
          colorTextSecondary: "#9c9890",

          colorBorder: "rgba(255,255,255,.08)",

          borderRadius: 10,
          fontFamily: "DM Sans",
        },

        components: {
          Table: {
            headerBg: "#16161f",
            headerColor: "#d4a843",

            colorBgContainer: "#13131a",

            rowHoverBg: "#1a1a24",

            borderColor: "rgba(255,255,255,.06)",
          },

          Modal: {
            contentBg: "#13131a",
            headerBg: "#13131a",
            titleColor: "#ede9e0",
          },

          Input: {
            colorBgContainer: "#16161f",
          },

          Select: {
            colorBgContainer: "#16161f",
          },

          DatePicker: {
            colorBgContainer: "#16161f",
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </QueryClientProvider>,
);
