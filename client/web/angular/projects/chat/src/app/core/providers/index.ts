import { inject, provideEnvironmentInitializer } from "@angular/core";
import { SplashScreenService } from "./splash-screen.service";

export const provideApp = () => {
  return [
    provideEnvironmentInitializer(() => inject(SplashScreenService)),
  ];
};
