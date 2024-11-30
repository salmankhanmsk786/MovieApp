import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BaseFormComponent } from '../../base-form.component';
import { AuthService } from '../auth.service';
import { RegisterRequest } from './register-request';
import { RegisterResult } from './register-result';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseFormComponent implements OnInit {
  title?: string;
  registerResult?: RegisterResult;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }
  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
    });
  }
  onSubmit() {
    var registerRequest = <RegisterRequest>{};
    registerRequest.firstName = this.form.controls['firstName'].value;
    registerRequest.lastName = this.form.controls['lastName'].value;
    registerRequest.email = this.form.controls['email'].value;
    registerRequest.password = this.form.controls['password'].value;
    registerRequest.confirmPassword =
      this.form.controls['confirmPassword'].value;

    this.authService.register(registerRequest).subscribe({
      next: (result) => {
        console.log(result);
        this.registerResult = result;
        if (result.success) {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.log(error);
        if (error.status == 401) {
          this.registerResult = error.error;
        }
      },
    });
  }
}
