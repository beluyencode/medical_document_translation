import { Injectable } from '@angular/core';

@Injectable()
export class StandaloneService {
  math = Math.random();
  constructor() { }
}
