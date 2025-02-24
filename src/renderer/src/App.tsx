import { useEffect } from "react";
import { useStore } from "./store";
import { toaster } from "./components/ui/toaster";

import { Box } from "styled-system/jsx";
import { Tabs } from "./components/ui/tabs";
import { Icon } from "./components/ui/icon";
import { IconButton } from "./components/ui/icon-button";
import { Toast } from "./components/ui/toast";
import { Home } from "./tabs/Home";
import { Settings } from "./tabs/Settings";
import { Appearance } from "./tabs/Appearance";
import { Uploader } from "./components/uploader/Uploader";
import { HomeIcon, Bolt, SunMoon, X } from "lucide-react";

function App(): JSX.Element {
  const { isDarkMode } = useStore();

  const tabs = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "settings", label: "Settings", icon: Bolt },
    { id: "appearance", label: "Appearance", icon: SunMoon },
  ];

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode.value);
  }, [isDarkMode]);

  return (
    <>
      <Box
        w="100dvw"
        h="100dvh"
        p="2"
        bg="bg.default"
        overflowY="scroll"
        overflowX="hidden"
      >
        {/* @ts-ignore */}
        <Box h="6" style={{ "-webkit-app-region": "drag" }} />
        <Tabs.Root variant="enclosed" defaultValue="home">
          <Tabs.List position="sticky" top="6" zIndex="2">
            {tabs.map((option) => (
              <Tabs.Trigger key={option.id} value={option.id}>
                <Icon size="sm">
                  <option.icon />
                </Icon>
                {option.label}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator />
          </Tabs.List>

          <Tabs.Content value="home">
            <Home />
          </Tabs.Content>

          <Tabs.Content value="settings">
            <Settings />
          </Tabs.Content>

          <Tabs.Content value="appearance">
            <Appearance />
          </Tabs.Content>
        </Tabs.Root>

        <Uploader />
      </Box>

      <Toast.Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
            <Toast.CloseTrigger asChild>
              <IconButton size="sm" variant="link">
                <X />
              </IconButton>
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toast.Toaster>
    </>
  );
}

export default App;
