import { createContext, useContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { settings } from "@store/index";
import { useDatabaseContext } from ".";
type LiveScraperContextProps = {
  isRunning: boolean;
  toggle: () => void;
}
type LiveScraperContextProviderProps = {
  children: React.ReactNode;
}

export const LiveScraperContext = createContext<LiveScraperContextProps>({
  isRunning: false,
  toggle: () => { },
});

export const useLiveScraperContext = () => useContext(LiveScraperContext);

export const LiveScraperContextProvider = ({ children }: LiveScraperContextProviderProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const { updateInvantoryListingPriceById } = useDatabaseContext();
  const handleToggle = async () => {
    const { access_token } = await settings.get();
    const running = !isRunning;
    setIsRunning(running);
    await invoke("toggle_live_scraper", {
      token: access_token,
      settings: {

        field1: "test",
        field2: 324
      }
    })
    // if (running)
    //   liveScraper.start();
    // else
    //   liveScraper.stop();
  }
  useEffect(() => {
    //listen to a event
    const unerror = listen("live-scraper-error", () => setIsRunning(false));

    const unprice = listen<{ id: number, price: number }>("live-scraper-update-price", (data) => {
      const { id, price } = data.payload;
      updateInvantoryListingPriceById(id, price);
    });

    // invoke a Rust function to start a loop for periodically emitting event.
    // start_backend_emitting_loop();

    return () => {
      unprice.then(f => f());
      unerror.then(f => f());
    }
  }, []);
  return (
    <LiveScraperContext.Provider value={{ isRunning, toggle: handleToggle }}>
      {children}
    </LiveScraperContext.Provider>
  )
}