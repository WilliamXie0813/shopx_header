import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { defaultTheme, type ThemeTokens } from "./types";
import { mergeOverrides } from "./utils";
import { ThemeDevToolApiContext } from "./devtoolContext";

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeTokens>(defaultTheme);

export function ThemeProvider({
	theme = defaultTheme,
	children,
}: {
	theme?: ThemeTokens;
	children: ReactNode;
}) {
	const api = useContext(ThemeDevToolApiContext);
	const overrides = api?.overrides ?? {};
	const merged = mergeOverrides(theme, overrides);
	return (
		<ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
	return useContext(ThemeContext);
}
