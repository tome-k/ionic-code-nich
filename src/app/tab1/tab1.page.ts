import { Component } from '@angular/core';
import { TimestampService } from '../service/timestampService';
import { PopoverController, AlertController } from '@ionic/angular';
import { ColorPickerPage } from '../module/color-picker/color-picker.page';
import { ColorService } from '../service/colorService';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    // Fake data
    storage = {
      setting: [{
        label: 'work',
        color: '#e45a33',
      }, {
        label: 'study',
        color: '#fde84e',
      }, {
        label: 'play',
        color: '#9ac53e',
      }, {
        label: 'others',
        color: '#4488ff',
      }, {
        label: 'sleep',
        color: '#06394a',
      }, {
        label: 'none',
        color: '#808080',
      }],
      defaultSetting: [{
        label: 'work',
        color: '#e45a33',
      }, {
        label: 'study',
        color: '#fde84e',
      }, {
        label: 'play',
        color: '#9ac53e',
      }, {
        label: 'others',
        color: '#4488ff',
      }, {
        label: 'sleep',
        color: '#06394a',
      }, {
        label: 'none',
        color: '#808080',
      }],
      record: [{
        id: 0,
        timestamp: 0,
        label: 'none',
        color: '#808080',
      }, {
        id: 1,
        timestamp: this.ts.getTimestampToday() - 11000,
        label: 'others',
        color: '#4488ff',
      }, {
        id: 2,
        timestamp: this.ts.getTimestampToday() - 1000,
        label: 'work',
        color: '#e45a33',
      }, {
        id: 3,
        timestamp: this.ts.getTimestampToday() + 1000,
        label: 'study',
        color: '#fde84e',
      }, {
        id: 4,
        timestamp: this.ts.getTimestampToday() + 2000,
        label: 'play',
        color: '#9ac53e',
      }, {
        id: 5,
        timestamp: this.ts.getTimestampToday() + 4000,
        label: 'others',
        color: '#4488ff',
      }, {
        id: 6,
        timestamp: this.ts.getTimestampToday() + 8000,
        label: 'sleep',
        color: '#06394a',
      }],
      displayRecordIdList: [],
      editcache: [],
    };

  constructor(
    private ts: TimestampService,
    private cs: ColorService, // Notice only used in html would prompt 'declared but never read'
    public pop: PopoverController,
    public alertController: AlertController
    ) {
      // Refresh every second
      setInterval(() => {
        // Synchronize the cursor in range if not in editing
        if (!this.recordRngEditingFlg) {
          this.lengthTimeSetPosition = this.propRngEnd * this.lengthRngStandard;
          this.timeSet = this.ts.getTimestampNow();
        }
        // Show title local time in seconds
        this.ts.showTimeInSeconds('timeNow');
        // Show drag range time in seconds
        this.ts.showTimeInSeconds('timeDrag', this.timeSet);
        // Range start and end proportion
        this.propRngStart = this.storage.record[this.storage.record.length - 1].timestamp - this.ts.getTimestampToday() > 0 ?
          (this.storage.record[this.storage.record.length - 1].timestamp - this.ts.getTimestampToday()) / 86400 : 0;
        this.propRngEnd = (this.ts.getTimestampNow() - this.ts.getTimestampToday()) / 86400;
        // Flash the border display css flag
        this.flashCssFlg = this.flashCssFlg ? 0 : 1;
      }, 1000);
      // Refresh every minute
      setInterval(() => {
        // Show record display
        this.calculateEachDayDisplay(this.ts.getTimestampToday());
      }, 60000);
  }

  // label last
  labelLast = this.storage.record[this.storage.record.length - 1].label;
  // color last
  colorLast = this.storage.record[this.storage.record.length - 1].color;
  // Edit label flag
  labelEditingFlg = 0;
  // Edit range flag
  recordRngEditingFlg = 0;
  // Flash css flag
  flashCssFlg = 0;
  // display id and timestamp list
  displayList = [];

  // range length
  lengthRngStandard = 600;
  // range start proportion
  propRngStart = 0;
  // range end proportion
  propRngEnd = (this.ts.getTimestampNow() - this.ts.getTimestampToday()) / 86400;
  // range cursor proportion
  propRngCursor = (this.ts.getTimestampNow() - this.ts.getTimestampToday()) / 86400;
  // range cursor height value
  lengthTimeSetPosition = this.propRngCursor * this.lengthRngStandard;
  // range cursor time set by value
  timeSet = this.ts.getTimestampNow();

  // Added label name
  labelAdded = '';
  // Added label color
  colorAdded = '';
  // length of padding offset of div
  lengthRngPaddingA = this.lengthRngStandard / 48;
  // length of padding offset of input range
  lengthRngPaddingB = this.lengthRngStandard / 96;
  // length full
  lengthRngFull = this.lengthRngStandard * 25 / 24;

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnInit() {
    // TODO get the data from storage
    console.log('Start up');
    // Refresh today display
    this.calculateEachDayDisplay(this.ts.getTimestampToday());
    // Response the range changing
    document.getElementById('rangeTime').addEventListener('input', () => {
      // Get the setted time from record edit input
      this.timeSet = this.ts.getTimestampToday() + Math.floor(this.lengthTimeSetPosition / this.lengthRngStandard * 86400);
      this.recordRngEditingFlg = this.timeSet !== this.ts.getTimestampNow() ? 1 : 0;
      // Show drag range time in seconds
      this.ts.showTimeInSeconds('timeDrag', this.timeSet);
    });
  }

  // Add record
  onLabelClick(labelSelected: string) {
    // If same with current label, alert, do noting
    if (this.labelLast === labelSelected) {
      this.pushAlert('currentEventTheSame');
      return;
    }
    // If multiple labels at the same time, alert, do nothing
    if (this.timeSet === this.storage.record[this.storage.record.length - 1].timestamp) {
      this.pushAlert('multiLabelsOneTime');
      return;
    }
    // Add
    // At least one item of record existence promised
    // Record id well sorted and continuous promised
    this.storage.record.push({
      id: this.storage.record.length,
      timestamp: this.recordRngEditingFlg ? this.timeSet : this.ts.getTimestampNow(),
      label: labelSelected,
      color: this.storage.setting.filter(obj => obj.label === labelSelected)[0].color,
    });
    // Record label and color last (added)
    this.labelLast = this.storage.record[this.storage.record.length - 1].label;
    this.colorLast = this.storage.record[this.storage.record.length - 1].color;
    // Refresh today display
    this.calculateEachDayDisplay(this.ts.getTimestampToday());
  }

  // Remove record
  onLabelRevert() {
    // Remove
    this.storage.record.pop();
    // Save the default
    if (!this.storage.record.length) {
      this.storage.record.push({
        id: 0,
        timestamp: 0,
        label: 'default',
        color: '#05d59e',
      });
    }
    // Revert label and color last
    this.labelLast = this.storage.record[this.storage.record.length - 1].label;
    this.colorLast = this.storage.record[this.storage.record.length - 1].color;
    // Refresh today display
    this.calculateEachDayDisplay(this.ts.getTimestampToday());
  }

  // Add label
  // Setting may be empty
  // Uniqueness ensured
  async onLabelAdd(event: Event, label: string) {
    // Set the label added
    this.labelAdded = label;
    // If the label name inputed is empty, alert, do nothing.
    if (!this.labelAdded) {
      this.pushAlert('inputLabelNull');
      // TODO give focus to input
      return;
    // If The label name inputed exist, alert, do nothing.
    } else if (this.storage.setting.some(obj => obj.label === this.labelAdded)) { // if setting is empty, there is no error.
      this.pushAlert('inputLabelExist');
      // TODO give focus to input
      return;
    }
    // Show the color picker template and set the color selected.
    await this.colorPicking(event);
    // If the select color is empty, do nothing and let the user to push the button and pick again.
    if (!this.colorAdded) {
      return;
    // If The color selected exist, alert, do nothing.
    } else if (this.storage.setting.some(obj => obj.color === this.colorAdded)) {
      this.pushAlert('selectColorExist');
      this.colorAdded = '';
      return;
    }
    // TODO check if write success
    this.storage.setting.push({label: this.labelAdded, color: this.colorAdded});
    this.labelAdded = '';
    this.colorAdded = '';
  }

  // Select color from module
  async colorPicking(event: Event) {
    // PopoverController, pop a component over layout
    const colorComponent = await this.pop.create({
      // component
      component: ColorPickerPage,
      // event
      event,
      // props
      componentProps: {
        setting: this.storage.setting,
      }
    });
    // show the component
    colorComponent.present();
    // Define the dismiss event, catch the return data
    await colorComponent.onDidDismiss()
        .then((data) => {
          // Color selected
          this.colorAdded = data.data;
      });
  }

  // Remove label
  // Only remove the existing label from displayed button
  // Remove the only one of selected
  onLabelDelete(label: string) {
    const itemDelete = this.storage.setting.filter(obj => obj.label === label)[0]; // Uniqueness premised
    const indexOfItemDelete = this.storage.setting.indexOf(itemDelete);
    this.storage.setting.splice(indexOfItemDelete, 1);
  }

  // Edit label
  onLabelEdit() {
    this.labelEditingFlg = this.labelEditingFlg ? 0 : 1;
    this.labelAdded = '';
    this.colorAdded = '';
  }

  // Set label to default
  onLabelDefault() {
    // Pass object by reference: NG
    // this.storage.setting = this.storage.defaultSetting;
    // Pass object by value: OK
    this.storage.setting = Object.create(this.storage.defaultSetting);
  }

  // Make common component event processing code
  // For multiple days display
  // Have two situation, one is that past date display, another is today's display
  // Need to consider the border problem
  // Deal with each day
  calculateEachDayDisplay(calDayTimestamp: number) {
    // Initialize
    const timeNow: number = this.ts.getTimestampNow();
    let timeStopCal: number;
    const timeDayStart: number = calDayTimestamp;
    const timeDayEnd: number = timeDayStart + 86400; // 60*60*24
    const resultList: {length: number, label: string, color: string, timestamp: number, id: number}[] = [];
    // Get record data via timestamp in range of today [)
    const recordCal = Object.create(this.storage.record.filter(obj => obj.timestamp >= timeDayStart && obj.timestamp < timeDayEnd));
    // Deal with the top
    // The situation when one event start before the day calculating and last till that day
    // Noticed that we assume there would always be a default record item with timestamp 1970, so it would be added
    if (recordCal.some((obj: { timestamp: number; }) => obj.timestamp !== timeDayStart)) {
      // Find the minimum id
      const recordHeadItemId: number = recordCal.reduce(
        (prev: { id: number; }, curr: { id: number; }) => prev.id < curr.id ? prev : curr).id;
      // Find the record one before minimum via id
      // Assume the uniqueness of data recorded
      const recordHeadItem = Object.create(this.storage.record.filter(obj => obj.id === recordHeadItemId - 1)[0]);
      // Change the record timestamp to today start for calcualte
      recordHeadItem.timestamp = timeDayStart;
      // Add the record in the top of record list for calculate
      recordCal.splice(0, 0, recordHeadItem);
    }
    // Deal with the bottom
    timeStopCal = timeNow >= timeDayStart && timeNow < timeDayEnd ? timeNow : timeDayEnd;
    // Calculate
    for (let i = 0; i < recordCal.length; i++) {
      const timeStart: number = recordCal[i].timestamp;
      const timeEnd: number = i === recordCal.length - 1 ? timeStopCal : recordCal[i + 1].timestamp;
      resultList.push({
        // TODO Attention result 0 posibility, check if affected in HTML
        // Giving more precious calculate results than Math.floor
        length: parseFloat(((timeEnd - timeStart) / 86400 * this.lengthRngStandard).toFixed(2)),
        label: recordCal[i].label,
        color: recordCal[i].color,
        timestamp: timeDayStart,
        id: recordCal[i].id,
      });
    }
    // Give the display data list
    this.displayList = resultList;
  }

  // Alert handler: presentAlertMultipleButtons
  async pushAlert(alertId: string) {
    switch (alertId) {
      // Current event is the same as button clicked when adding record.
      case('currentEventTheSame'): {
        const alert = await this.alertController.create({
          header: 'Ooouch, nothing performed',
          subHeader: 'On click label button',
          message: 'Current event is the same as button clicked when adding record. Try to choose another one.',
          buttons: [{
            text: 'Confirm',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Alert confirmed: ' + alertId);
            }
          }]
        });
        await alert.present();
        break;
      }
      // Multiple labels added at the same time (within one second).
      case('multiLabelsOneTime'): {
        const alert = await this.alertController.create({
          header: 'Ooops, please notice',
          subHeader: 'On click label button',
          message: 'Multiple labels added at the same time (within one second). Only the first one would be recorded.',
          buttons: [{
            text: 'Confirm',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Alert confirmed: ' + alertId);
            }
          }]
        });
        await alert.present();
        break;
      }
      // The label name inputed is empty.
      case('inputLabelNull'): {
        const alert = await this.alertController.create({
          header: 'Ooouch, nothing performed',
          subHeader: 'On click add button',
          message: 'Label name inputed is empty. Please input it before adding.',
          buttons: [{
            text: 'Confirm',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Alert confirmed: ' + alertId);
            }
          }]
        });
        await alert.present();
        break;
      }
      // The label name inputed exist.
      case('inputLabelExist'): {
        const alert = await this.alertController.create({
          header: 'Ooouch, nothing performed',
          subHeader: 'On click add button',
          message: 'The label name inputed exist. Please input another label name.',
          buttons: [{
            text: 'Confirm',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Alert confirmed: ' + alertId);
            }
          }]
        });
        await alert.present();
        break;
      }
      // The color selected exist.
      case('selectColorExist'): {
        const alert = await this.alertController.create({
          header: 'Ooouch, nothing performed',
          subHeader: 'On click add button',
          message: 'The color selected exist. Please select another color.',
          buttons: [{
            text: 'Confirm',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Alert confirmed: ' + alertId);
            }
          }]
        });
        await alert.present();
        break;
      }
      default: break;
    }
    return;
  }

}
