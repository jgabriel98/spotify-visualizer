import basicSsl from '@vitejs/plugin-basic-ssl';
import path from "path";
import { defineConfig } from 'vite';
import { comlink } from "vite-plugin-comlink";
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    comlink(),
    solid(),
    basicSsl()
  ],
  resolve:{
    alias: {
      "~": path.resolve(__dirname, "./src")
    }
  },
  worker: {
    plugins: () => [comlink()],
  }
})
