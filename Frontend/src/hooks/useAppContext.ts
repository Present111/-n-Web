import { useContext } from "react";
import { AppContext } from "../contexts/AppContext.tsx";
import type { AppContext as AppContextType } from "../contexts/AppContext.tsx";

const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContextType;
};

export default useAppContext;