import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any = {}

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem("token");
    if (storedUser) {
      let decodedObj: any = jwtDecode(storedUser)
      this.user = decodedObj;
    }
  }

  logOut(): void {
    sessionStorage.clear()
    window.location.reload();
    this.router.navigate(['/']);
  }
}
