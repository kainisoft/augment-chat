import { inject, provideEnvironmentInitializer } from "@angular/core";
import { SplashScreenService } from "./splash-screen.service";
import { IconService } from "../services/icon.service";

export const provideApp = () => {
  return [
    provideEnvironmentInitializer(() => inject(SplashScreenService)),
    provideEnvironmentInitializer(() => inject(IconService)),
  ];
};
