import {terser} from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [{
      name: 'bundles',
      file: pkg.main,
      format: 'umd',
      sourcemap: true
    }],
    plugins: [
      typescript({
        tsconfigOverride: {
          target: 'es2015',
          module: 'umd'
        },
      }),
      terser()
    ],
  }, {
    input: 'src/index.ts',
    output: [{
      file: pkg.fesm2015,
      format: 'es',
      sourcemap: true
    }],
    plugins: [
      typescript({
        tsconfigOverride: {
          target: 'es2015',
          module: 'es2015'
        },
      }),
      terser()
    ],
  }, {
    input: 'src/index.ts',
    output: [{
      file: pkg.fesm2020,
      format: 'es',
      sourcemap: true,
    }],
    plugins: [
      typescript({
        tsconfigOverride: {
          target: 'es2020',
          module: 'es2020'
        }
      }),
      terser()
    ],
  }, {
    input: 'src/index.ts',
    output: [{
      file: pkg.fesm2022,
      format: 'es',
      sourcemap: true
    }],
    plugins: [
      typescript({
        tsconfigOverride: {
          target: 'es2022',
          module: 'es2022'
        }
      }),
      terser()
    ],
  }
];
