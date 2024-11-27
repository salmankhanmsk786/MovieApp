import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { BaseFormComponent } from '../../base-form.component';
import { ForgotPasswordRequest } from './forgot-password-request';
import { ForgotPasswordResult } from './forgot-password-result';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent
  extends BaseFormComponent
  implements OnInit
{
  forgotPasswordResult?: ForgotPasswordResult;
  constructor(private authService: AuthService) {
    super();
  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onSubmit() {
    var forgotPasswordRequest = <ForgotPasswordRequest>{};
    forgotPasswordRequest.email = this.form.controls['email'].value;
    this.authService.forgotPassword(forgotPasswordRequest).subscribe({
      next: (result) => {
        console.log(result);
        this.forgotPasswordResult = result;
        if (result.success) {
          this.form.reset();
        }
        console.error(result);
      },
      error: (error: any) => {
        console.log(error);
        if (error.status == 401) {
          this.forgotPasswordResult = error.error;
        }
      },
    });
  }
}
