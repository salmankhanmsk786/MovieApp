// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from '../auth.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent {
//   loginForm: FormGroup;

//   constructor(private fb: FormBuilder, private authService: AuthService) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required]]
//     });
//   }

//   onSubmit() {
//     if (this.loginForm.valid) {
//       this.authService.login(this.loginForm.value).subscribe(response => {
//         console.log('User logged in successfully', response);
//       }, error => {
//         console.error('Login error', error);
//       });
//     }
//   }
// }
