import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroySubject = new Subject();

  isLoggedIn: boolean = false;
  email: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.authService.authStatus
      .pipe(takeUntil(this.destroySubject))
      .subscribe((result) => {
        this.isLoggedIn = result;
        if (this.isLoggedIn) {
          this.email = this.authService.getemail() || '';
        }
      });
  }
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.email = this.authService.getemail() || '';
    }
  }
  ngOnDestroy() {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}
