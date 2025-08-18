import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { getDefaultTheme } from '../configs/theme.config';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default theme', () => {
    const currentTheme = service.currentTheme();
    expect(currentTheme).toBeTruthy();
    expect(currentTheme.name).toBeTruthy();
    expect(currentTheme.displayName).toBeTruthy();
  });

  it('should be able to set a theme', () => {
    const defaultTheme = getDefaultTheme(true); // Dark theme
    service.setTheme(defaultTheme);
    
    const currentTheme = service.currentTheme();
    expect(currentTheme.name).toBe(defaultTheme.name);
    expect(currentTheme.isDark).toBe(true);
  });

  it('should toggle dark mode', () => {
    const initialTheme = service.currentTheme();
    const initialIsDark = initialTheme.isDark;
    
    service.toggleDarkMode();
    
    const newTheme = service.currentTheme();
    expect(newTheme.isDark).toBe(!initialIsDark);
  });

  it('should validate theme configuration', () => {
    const defaultTheme = getDefaultTheme();
    const validation = service.validateTheme(defaultTheme);
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
    expect(validation.accessibility).toBeTruthy();
  });
});