import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        exercise_11: resolve(__dirname, 'exercises/primitives.html'),
        exercise_12: resolve(__dirname, 'exercises/cameras_and_controls.html'),
        exercise_13: resolve(__dirname, 'exercises/texture_coordinates.html'),
        exercise_14: resolve(__dirname, 'exercises/hierarchical_transformations.html'),
        exercise_21: resolve(__dirname, 'exercises/telelumen_modeling.html'),
        exercise_22: resolve(__dirname, 'exercises/graphic_user_interface.html'),
        exercise_23: resolve(__dirname, 'exercises/lightings.html'),
        exercise_24: resolve(__dirname, 'exercises/material_properties.html'),
        exercise_25: resolve(__dirname, 'exercises/surface_lighting.html'),
        exercise_26: resolve(__dirname, 'exercises/shadow_maps.html'),
      },
    },
  },
})