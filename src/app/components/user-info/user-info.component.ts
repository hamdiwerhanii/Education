import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  user: any;
  userId!: any;
  constructor(private userService: UserService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.userId = this.activatedRoute.snapshot.paramMap.get("id");
    this.userService.getUserById(this.userId).subscribe((data) => {
      console.log("Here data from BE", data)
      if (data.user) {
        this.user = data.user;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Match Not Found',
          text: 'No match data was returned from the server.',
        });
      }
    })
  }
}
