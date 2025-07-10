import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(objs: any, x: string) {
    if (x == "") {
      return objs;
    }
    return objs.filter((obj: any) => obj.speciality.toLowerCase().includes(x.toLowerCase()))
  }

}
