// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as ts from 'typescript';

import { dummyB } from '../project-B/project-b';
// @yanice:import-boundaries ignore-next-line
import { dummyC } from '../project-C/project-c';
import { dummyA2 } from './project-a-2';

export const dummyA1: number = dummyB + dummyC + dummyA2;

// eslint-disable-next-line no-console
console.log(dummyA1);
