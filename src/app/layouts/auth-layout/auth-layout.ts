import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthStory} from '../../components/auth-story/auth-story';
@Component({selector:'rp-auth-layout',imports:[RouterOutlet,AuthStory],templateUrl:'./auth-layout.html',styleUrl:'./auth-layout.css'})
export class AuthLayout{}
