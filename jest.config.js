module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/dist/"
  ],
  moduleNameMapper: {
      '^@app/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true
};
