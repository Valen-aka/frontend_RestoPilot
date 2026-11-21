import {SessionBoundary} from './core/services/session-boundary.service';
import {EmailConfirmationReturn} from './core/services/email-confirmation-return.service';
import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AssistantChat} from './components/assistant-chat/assistant-chat';
@Component({selector:'rp-root',imports:[RouterOutlet,AssistantChat],templateUrl:'./app.html',styleUrl:'./app.css'})
export class App{constructor(){inject(EmailConfirmationReturn);inject(SessionBoundary);}}
