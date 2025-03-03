import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class TranslatePopupService {

  constructor(private http: HttpClient) { }

  translate(text: string) {
    const url = `https://api.tracau.vn/WBBcwnwQpV89/s/${text}/vi`;
    return this.http.get(url);
  }

  translateGoogle(text: string) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURI(text)}`;
    return this.http.get(url)
  }
}
