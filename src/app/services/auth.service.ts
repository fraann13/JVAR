import { Injectable } from '@angular/core';
import Parse from 'parse';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(false);
    private userNameSubject = new BehaviorSubject<string>('');

    userName = this.userNameSubject.asObservable();
    isLoggedIn$ = this.loggedIn.asObservable();

    constructor() {
        this.loggedIn.next(!!Parse.User.current());
    }

    async login(username: string, password: string): Promise<boolean> {
        try {
            const user = await Parse.User.logIn(username, password);
            const name = user.get('name') ?? '';

            this.userNameSubject.next(name);
            this.loggedIn.next(true);

            return true;
        } catch (error) {
            this.loggedIn.next(false);

            return false;
        }
    }

    async logout(): Promise<void> {
        await Parse.User.logOut();
        this.loggedIn.next(false);
    }

    async getUserName(): Promise<string> {
        const currentUser = Parse.User.current();
        const name = currentUser ? (currentUser.get('name') ?? '') : '';

        this.userNameSubject.next(name);
        
        return name;
    }
}