import {EventAggregator} from 'aurelia-event-aggregator';
import {WebAPI} from './web-api';
import {ContactUpdated, ContactViewed, NoContact, NavigateTo} from './messages';
import {inject} from 'aurelia-framework';

@inject(WebAPI, EventAggregator)
export class ContactList {
  contacts;
  selectedId = 0;

  constructor(private api: WebAPI, private ea: EventAggregator) {
    ea.subscribe(ContactViewed, msg => this.select(msg.contact));
    ea.subscribe(NoContact, msg => this.selectedId = 0);
    ea.subscribe(ContactUpdated, msg => {
      let id = msg.contact.id;
      let found = this.contacts.find(x => x.id == id);
      if(found === undefined){
        this.contacts.push(msg.contact);
        ea.publish(new NavigateTo(msg.contact));
      } else {
        Object.assign(found, msg.contact);
      }
    });
  }

  created() {
    this.api.getContactList().then(contacts => this.contacts = contacts);
  }

  select(contact) {
    // We need this as it is called from contact-list.html <a> trigger
    this.selectedId = contact.id;
    return true;
  }

  deleteContact(contact){
    if (confirm('Are you sure you want to delete ' + contact.firstName + '?')) {
      this.api.deleteContact(contact.id).then( okMsg => {
        this.api.getContactList().then(contacts => {
          this.contacts = contacts;
          this.selectedId = 0;
        });
      });
      return true;  // We need this make the <a route-href work!
    } else {
      return false; // This prevents the routing so that we stay looking at the current record.
    }
  }
}