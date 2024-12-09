import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../signalr.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  message: string = '';
  onlineUsers: string[] = [];
  messages: any[] = [];

  constructor(private signalRService: SignalRService) {}

  ngOnInit(): void {
    this.signalRService.onlineUsers$.subscribe((users) => {
      this.onlineUsers = users;
    });

    this.signalRService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.signalRService.sendMessage(this.message);
      this.message = '';
    }
  }
}
