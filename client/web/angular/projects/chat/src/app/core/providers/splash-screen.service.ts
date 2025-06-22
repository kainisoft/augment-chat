import { DOCUMENT, inject, Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, first } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SplashScreenService {
  private _document = inject(DOCUMENT);
  private _router = inject(Router);

  constructor() {
    // Hide it on the first NavigationEnd event
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        first()
      )
      .subscribe(() => {
        this.hide();
      });
  }

  hide(): void {
    const splashScreen = this._document.getElementById('splash-screen');
      
      if (splashScreen) {
        splashScreen.remove();
      }
  }
}
