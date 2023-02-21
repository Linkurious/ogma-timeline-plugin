import {name} from './package.json'

export default {
  build: {
    lib: {
      entry: 'src/index.ts',
      name,
    }
  }
}