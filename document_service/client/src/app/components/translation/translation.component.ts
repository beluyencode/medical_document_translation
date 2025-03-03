import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { type IConfig } from "@onlyoffice/document-editor-angular"
import { environment } from 'src/environments/environment.dev';

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent {
  fileOrigin: File;
  fileTranslation: File;
  viewDocx: boolean = false;
  fileDocx: string;
  config: IConfig;
  onlyOffice = environment.onlyOffice;

  constructor(private http: HttpClient) { }

  onChangeOriginFile(event: any) {
    this.fileOrigin = event.target.files[0];
  }

  onChangeTranslationFile(event: any) {
    this.fileTranslation = event.target.files[0];
  }

  onDocumentReady = () => {
    console.log("Document is loaded")
  }

  onLoadComponentError = (errorCode: number, errorDescription: any) => {
    switch (errorCode) {
      case -1: // Unknown error loading component
        console.log(errorDescription)
        break

      case -2: // Error load DocsAPI from http://documentserver/
        console.log(errorDescription)
        break

      case -3: // DocsAPI is not defined
        console.log(errorDescription)
        break
    }
  }

  trainings() {
    window.DocEditor.instances.docxEditor.downloadAs();

  }

  viewDocxFile() {
    if (this.fileOrigin && this.fileTranslation) {
      const formData = new FormData();
      formData.append('fileOrigin', this.fileOrigin);
      formData.append('fileTranslation', this.fileTranslation);
      this.http.post(environment.convertService + 'convert',
        formData,
      ).subscribe((res: any) => {
        this.config = {
          document: {
            fileType: "docx",
            key: Math.random().toString(36).substring(7),
            title: res.path,
            url: environment.publicPath + res.path,
          },
          documentType: "word",
          editorConfig: {
            customization: {
              close: {
                visible: false,
                text: "",
              },
              spellcheck: false,
              trackChanges: true  // 🔹 Bật Track Changes
            }
          },
          events: {
            onDownloadAs: (event: any) => {
              if (event.data.url) {
                fetch(event.data.url).then((response) => response.blob()).then((data) => {
                  const file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                  const formData = new FormData();
                  formData.append('file', file);
                  this.http.post(environment.convertService + 'check-change', formData).subscribe((res: any) => {
                    console.log(res);
                  });
                });
              }
            },
            onRequestStartFilling: function (event: object): void {
            }
          }
        }
        this.viewDocx = true;
      });

    }
  }
}
