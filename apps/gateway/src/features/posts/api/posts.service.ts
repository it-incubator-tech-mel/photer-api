import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

Injectable();
export class PostsService {
  constructor(@Inject('POSTS_SERVICE') private readonly client: ClientProxy) {}

  create(data: any): Observable<string> {
    // Отправляем сообщение с паттерном posts.create
    const message = this.client.emit<string>({ cmd: 'testing/posts' }, data);
    console.log(message, 'message');
    return message;
  }
}
