import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type ThemeMode = "light" | "dark"

type UiState = {
  theme: ThemeMode
}

const initialState: UiState = {
  theme: "dark",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
    },
  },
})

export const { setTheme, toggleTheme } = uiSlice.actions
export default uiSlice.reducer
