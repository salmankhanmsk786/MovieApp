import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  private messagesSubject = new BehaviorSubject<any[]>([]);

  onlineUsers$ = this.onlineUsersSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.startConnection();
    this.registerOnServerEvents();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chathub`, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  private registerOnServerEvents() {
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messagesSubject.next([
        ...this.messagesSubject.value,
        { user, message },
      ]);
    });

    this.hubConnection.on('UserConnected', (user: string) => {
      this.updateOnlineUsers();
      console.log(user + ' connected');
    });

    this.hubConnection.on('UserDisconnected', (user: string) => {
      this.updateOnlineUsers();
      console.log(user + ' disconnected');
    });

    this.hubConnection.on('UpdateOnlineUsers', (users: string[]) => {
      this.onlineUsersSubject.next(users);
    });
  }

  sendMessage(message: string) {
    this.hubConnection
      .invoke('SendMessage', message)
      .catch((err) => console.error(err));
  }

  private updateOnlineUsers() {
    this.hubConnection
      .invoke('GetOnlineUsers')
      .then((users: string[]) => {
        this.onlineUsersSubject.next(users);
      })
      .catch((err) => console.error('Error fetching online users:', err));
  }
}
