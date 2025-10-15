import { After, Before, Status } from '@cucumber/cucumber';


Before(function () {
// could set up per-scenario fixtures here
});


After(function (testCase) {
if (testCase.result?.status === Status.FAILED && (this as any).response) {
const res = (this as any).response;
// Helpful debug dump when a scenario fails
// eslint-disable-next-line no-console
console.error('\n--- Debug Response Dump ---');
console.error('Status:', res.status);
console.error('Headers:', res.headers);
console.error('Body:', JSON.stringify(res.data, null, 2));
console.error('--- End Debug Dump ---\n');
}
});