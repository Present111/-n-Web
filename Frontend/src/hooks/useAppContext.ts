import { useContext } from "react";
import { AppContext } from "../contexts/AppContext.ts";
import type { AppContext as AppContextType } from "../contexts/AppContext.ts";

const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContextType;
};

export default useAppContext;
