import { createContext, useContext } from "react";
export const MapContext = createContext(null);
export const useMap = () => useContext(MapContext);
