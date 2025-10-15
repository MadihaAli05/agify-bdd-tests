export default {
  default: {
    require: [
      'ts-node/register',
      'features/support/world.ts',
      'features/support/hooks.ts',
      'features/step_definitions/**/*.ts',
    ],
    publishQuiet: true,
    format: ['progress', 'html:reports/cucumber-report.html'],
    paths: ['features/**/*.feature'],
    parallel: 0,
    worldParameters: {},
    tags: 'not @optional',
  },
};
