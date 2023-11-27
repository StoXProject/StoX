import { ElementRef, Injector } from '@angular/core';

export abstract class AppComponentBase {
  elementRef: ElementRef;

  constructor(injector: Injector) {
    this.elementRef = injector.get(ElementRef);
  }
}
