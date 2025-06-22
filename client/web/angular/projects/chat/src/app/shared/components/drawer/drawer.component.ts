import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

export type DrawerMode = 'over' | 'side';
export type DrawerPosition = 'start' | 'end';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule
  ],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DrawerComponent {
  @Input() mode: DrawerMode = 'over';
  @Input() position: DrawerPosition = 'end';
  @Input() opened: boolean = false;
  @Input() fixed: boolean = true;
  
  @Output() openedChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  open(): void {
    this.opened = true;
    this.openedChange.emit(true);
  }

  close(): void {
    this.opened = false;
    this.openedChange.emit(false);
    this.closed.emit();
  }

  toggle(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }
}
