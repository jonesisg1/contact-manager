/*
 *  IJ170910 Added undo and changed methods.  
 *  IJ170831 Changed the contact interface to a class.
 *         - Using destructured parameters in the constructor keeps things tidy :) 
*/
import {inject, NewInstance} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationController} from 'aurelia-validation';
import {WebAPI} from './web-api';
import {ContactUpdated, ContactViewed} from './messages';
import {areEqual} from './utility';
import {log} from './log';
import {Contact} from './contact';


@inject(WebAPI, EventAggregator, NewInstance.of(ValidationController))

export class ContactDetail {
  routeConfig;
  contact: Contact;
  originalContact: Contact;
  hasFocusFirstName;
    
  constructor(private api: WebAPI, 
              private ea: EventAggregator,
              private valCtl: ValidationController) 
  {
    log.debug('ContactDetail.constructor');
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig; 
    log.debug('ContactDetail.activate - routeConfig.name:' + this.routeConfig.name);
    log.debug('ContactDetail.activate - No Errors:' + this.valCtl.errors.length)
    
    if(this.routeConfig.name == 'new') {

      this.contact = new Contact();
      this.originalContact = this.contact.clone();
      this.routeConfig.navModel.setTitle('New'); 
      this.ea.publish(new ContactViewed(this.contact));
      this.hasFocusFirstName = true;
    
    } else {
    
      return this.api.getContactDetails(params.id).then(contact => {       
        this.contact = new Contact(contact);
        this.originalContact = this.contact.clone();
        this.routeConfig.navModel.setTitle(this.contact.firstName);
        this.ea.publish(new ContactViewed(this.contact));
      });
    }
  }

  get canSave() {
    return this.contact.firstName && this.contact.lastName && !this.api.isRequesting && !this.valCtl.errors.length;
  }

  get changed() {
    return areEqual(this.originalContact, this.contact);
  }

  undo() {
    this.contact = this.originalContact.clone(); // Remember we want a different object!
    this.valCtl.reset(); // Assume the original state was valid.
  }
  
  save() {
    this.api.saveContact(this.contact).then(contact => {
      this.contact = new Contact(contact);
      this.originalContact = this.contact.clone();
      this.routeConfig.navModel.setTitle(this.contact.firstName);
      this.ea.publish(new ContactUpdated(this.contact));
    });
  }

  canDeactivate() {
    if(!areEqual(this.originalContact, this.contact)){
      let result = confirm('You have unsaved changes. Are you sure you wish to leave?');
      
      if(!result) {
        this.ea.publish(new ContactViewed(this.contact));
      }
      return result;
    }

    return true;
  }

  deactivate() {
    // Remove any error messages.
    this.valCtl.reset();
  }
}