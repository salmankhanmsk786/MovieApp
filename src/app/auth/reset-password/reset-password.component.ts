import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { ResetPasswordRequest } from './reset-password-request';
import { ResetPasswordResult } from './reset-password-result';
import { BaseFormComponent } from '../../base-form.component';

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
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.form = new FormGroup({
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    var resetPasswordRequest = <ResetPasswordRequest>{};
    resetPasswordRequest.password = this.form.controls['password'].value;
    resetPasswordRequest.confirmPassword =
      this.form.controls['confirmPassword'].value;
    resetPasswordRequest.token = this.token;
    this.authService.resetPassword(resetPasswordRequest).subscribe({
      next: (result: ResetPasswordResult) => {
        console.log(result);
        this.resetPasswordResult = result;
        if (result.success) {
          this.form.reset();
        }
        console.error(result);
      },
      error: (error: any) => {
        console.log(error);
        if (error.status == 401) {
          this.resetPasswordResult = error.error;
        }
      },
    });
  }
}
