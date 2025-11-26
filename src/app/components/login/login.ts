import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginError: string | null = null;
  isSubmitting: boolean = false;

  constructor(private authService: AuthService) { }

  async onLogin() {
    if (this.username.trim() === '' || this.password.trim() === '') {
      this.loginError = 'Por favor, completa todos los campos.';
      return;
    }

    this.loginError = null;
    this.isSubmitting = true;

    const success = await this.authService.login(this.username, this.password);

    if (success) {
      this.username = '';
      this.password = '';
    } else {
      this.loginError = 'Usuario o contraseña incorrectos. Por favor, verifica tus credenciales.';
    }
    this.isSubmitting = false;
  }
}