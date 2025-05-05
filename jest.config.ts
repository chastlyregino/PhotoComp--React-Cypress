
export default {
    testEnvironment: 'jsdom',
    // preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
    },
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/__mocks__/fileMock.js',
        '^@/(.)$': '<rootDir>/src/$1'
    },
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!**/vendor/**'
    ],
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/coverage/',
      'package.json',
      'package-lock.json',
      'reportWebVitals.ts',
      'setupTests.ts',
      'index.tsx'
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}


// export default {
//     collectCoverage: true,
//     collectCoverageFrom: [
//       'src//*.{ts,tsx}',
//       '!src//.d.ts',
//       '!/vendor/'
//     ],
//     coverageDirectory: 'coverage',
//     testEnvironment: 'jsdom',
//     transform: {
//       '^.+\.(ts|tsx)$': 'ts-jest' // safer regex for file matching
//     },
//     coveragePathIgnorePatterns: [
//       '/node_modules/',
//       '/coverage/',
//       'package.json',
//       'package-lock.json',
//       'reportWebVitals.ts',
//       'setupTests.ts',
//       'index.tsx'
//     ],
//     moduleNameMapper: {
//       '\.(css|less|scss|sass)$': 'identity-obj-proxy',
//       '\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/mocks/fileMock.ts',
//       '^@/(.)$': '<rootDir>/src/$1'
//     },
//     testMatch: ['/tests//.[jt]s?(x)', '**/.{test,spec}.[jt]s?(x)'],
//     setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
//     moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
//   };

