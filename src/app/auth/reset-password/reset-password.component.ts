import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { ResetPasswordRequest } from './reset-password-request';
import { ResetPasswordResult } from './reset-password-result';
import { BaseFormComponent } from '../../base-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent
  extends BaseFormComponent
  implements OnInit
{
  resetPasswordResult?: ResetPasswordResult;
  token: string = '';
  email: string = '';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    this.form = new FormGroup({
      newPassword: new FormControl('', Validators.required),
      confirmNewPassword: new FormControl('', Validators.required),
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }

  onSubmit() {
    var resetPasswordRequest = <ResetPasswordRequest>{};

    resetPasswordRequest.newPassword = this.form.controls['newPassword'].value;
    resetPasswordRequest.confirmNewPassword =
      this.form.controls['confirmNewPassword'].value;
    resetPasswordRequest.token = this.token;
    resetPasswordRequest.email = this.email;

    if (!this.form.valid) {
      return;
    }

    if (
      resetPasswordRequest.newPassword !=
      resetPasswordRequest.confirmNewPassword
    ) {
      this.resetPasswordResult = {
        success: false,
        message: 'Passwords do not match',
      };
      return;
    }

    this.authService.resetPassword(resetPasswordRequest).subscribe({
      next: (result: ResetPasswordResult) => {
        console.log(result);
        this.resetPasswordResult = result;
        if (result.success) {
          this.form.reset();
          //add a snackbar to show the user that the password has been reset
          this.snackBar.open('Password reset successfully', 'Close', {
            duration: 2000,
          });
        }
        console.error(result);
      },
      error: (error: any) => {
        console.log(error);
        if (error.status == 401) {
          this.resetPasswordResult = error.error;
          //add a snackbar to show the user that the password reset failed
          this.snackBar.open('Password reset failed', 'Close', {
            duration: 2000,
          });
        }
      },
    });
  }
}
