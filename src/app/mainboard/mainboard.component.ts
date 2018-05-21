import {Component, OnInit} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {DataProvider} from "../shared/services/data.provider";
import {AlertController} from 'ionic-angular';
import {ModalController, ViewController} from 'ionic-angular';
import {SelectTaskModal} from "../selectTaskPopover/selectTask";
import {UserService} from "../shared/services/user.service";
import {TaskDetailPopover} from "./taskDetailPopover/taskDetail";


@Component({
  selector: 'page-mainboard',
  templateUrl: 'mainboard.component.html'
})
export class MainboardComponent implements OnInit {
  play = true;
  projects: any[];
  history: any[];
  project;
  timerFnc;

  constructor(private iab: InAppBrowser,
              public dataProvider: DataProvider,
              public user: UserService,
              public modalCtrl: ModalController,
              private alertCtrl: AlertController) {

  }

  showModal(object) {
    let modal = this.modalCtrl.create(SelectTaskModal, {item: object});
    modal.onDidDismiss(data => {
      if (data && data.item) {
        data.item.real_work_time = 1;
        data.item.finish_time = null;
        if(this.history.length>0 &&this.history[0].tasks.length>0){
          this.history[0].tasks[0].finish_time=1;
        }
       // let tmpTask = this.history.find(item=> item.tasks[0].finish_time === null);
       // if(tmpTask.tasks[0].finish_time) tmpTask.tasks[0].finish_time = 1;
        if (this.history.find(item => item.date === this.getDate())) {
          this.history[0].tasks.unshift(data.item);
        } else {
          this.history.unshift({
            date: this.getDate(),
            tasks: [data.item]
          })
        }
        this.runTimer(this.history[0].tasks[0]);
      }
    });
    modal.present();
  }

  taskDetails (task) {
    let modal = this.modalCtrl.create(TaskDetailPopover, {item: task});
    modal.present();
  }


  ngOnInit() {
    this.dataProvider.getProjects().subscribe((data) => {
      this.projects = data;
    });
    this.dataProvider.getMyTasks().subscribe((data: any[]) => {
      console.log(data, 'hist');
      this.history = data;
      this.history.forEach((item) => {
        if (item.tasks.length > 0 && !item.tasks[0].finish_time) {
          this.runTimer(item.tasks[0]);
        }
      });
    });
  }

  selectProject() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Select project');
    this.projects.forEach((item, index) => {
      alert.addInput({
        type: 'radio',
        label: item.name,
        value: item,
        checked: index === 0
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        this.showModal(data);
      }
    });
    alert.present();
  }



  startTimer(task) {
    this.history.forEach(item=>{
      item.tasks.forEach(task=>{
        task.finish_time =1;
      })
    });
    this.dataProvider.getTrelloTasks(task.project_id).subscribe((data: any[]) => {

      let alert2 = this.alertCtrl.create();
      alert2.setTitle('Move previous task ...');
      data.forEach((item) => {
        alert2.addInput({
          type: 'radio',
          label: item.name,
          value: item,
        });
      });
      alert2.addButton('Cancel');
      alert2.addButton({
        text: 'Ok',
        handler: (responce: any) => {
          let alert = this.alertCtrl.create();
          alert.setTitle('Move to ...');
          data.forEach((item) => {
            alert.addInput({
              type: 'radio',
              label: item.name,
              value: item,
            });
          });
          alert.addButton('Cancel');
          alert.addButton({
            text: 'Ok',
            handler: (data: any) => {
              task.finish_time = null;
              task.status = data.name;
              this.user.startTask({
                previousListId: responce.trello_id,
                previousListName: responce.name,
                task_name: task.task_name,
                trello_task_id: task.trello_task_id,
                description: task.description,
                trello_link: task.trello_link,
                time_for_work: task.time_for_work,
                listName: data.name,
                listId: data.trello_id,
              }, task.project_id).subscribe(() => {
                this.runTimer(task)
              });
            }
          });
          alert.present();

        }
      });
      alert2.present();



    })
  }

  stopTimer(task) {
    this.dataProvider.getTrelloTasks(task.project_id).subscribe((data: any[]) => {
      let alert = this.alertCtrl.create();
      alert.setTitle('Move to ...');
      data.forEach((item) => {
        alert.addInput({
          type: 'radio',
          label: item.name,
          value: item,
          checked: item.name === 'Testing'
        });
      });
      alert.addButton('Cancel');
      alert.addButton({
        text: 'Ok',
        handler: (data: any) => {
          this.user.stopTask({
            listId: data.trello_id,
            listName: data.name
          }, task.id, task.project_id).subscribe(() => {
            task.finish_time = 1;
            clearInterval(this.timerFnc);
          })
        }
      });
      alert.present();
    })
  }

  getDate() {
    let date = new Date();
    let formatedDate =
      (date.getUTCDate().toString().length === 1 ? '0' + date.getUTCDate() : date.getUTCDate())
      + "." +
      ((date.getUTCMonth() + 1).toString().length === 1 ? '0' + (date.getUTCMonth() + 1) : date.getUTCMonth() + 1)
      + "." +
      (date.getFullYear() + '').substring(2);
    return formatedDate;
  }

  runTimer(task) {
    clearInterval(this.timerFnc);
    this.timerFnc = setInterval(x => {
      task.real_work_time++;
    }, 1000);
  }
}
