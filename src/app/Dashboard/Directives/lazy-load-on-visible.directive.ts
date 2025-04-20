import {   Directive,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appLazyLoadOnVisible]',  
})

export class LazyLoadOnVisibleDirective implements OnDestroy {

  private observer: IntersectionObserver;

  constructor(
    private element: ElementRef,
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.observer.disconnect(); // stop observing after first load
      }
    }, { threshold: 0.1 }); // adjust threshold as needed
  }

  ngOnInit() {
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

}
