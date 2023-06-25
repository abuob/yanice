import { dummyB } from '../project-B/project-b';
// @yanice:import-boundaries ignore-next-statement
import { dummyC } from '../project-C/project-c';

export const dummyA: number = dummyB + dummyC;

// eslint-disable-next-line no-console
console.log(dummyA);
