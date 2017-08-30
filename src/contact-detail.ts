import {inject, NewInstance} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationRules, ValidationController, ValidationControllerFactory} from 'aurelia-validation';
import {WebAPI} from './web-api';
import {ContactUpdated, ContactViewed} from './messages';
import {areEqual} from './utility';
import {log} from "./log";

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
}

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
    
    this.valCtl.reset();
    
    if(this.routeConfig.name == 'new') {
      
      let newContact = {
        id:0,
        firstName:'',
        lastName:'',
        email:'',
        phoneNumber:''
      };
 
      this.contact = <Contact>newContact;
      this.routeConfig.navModel.setTitle('New');
      this.originalContact = JSON.parse(JSON.stringify(this.contact));
      this.ea.publish(new ContactViewed(this.contact));
      this.hasFocusFirstName = true;
    
    } else {
    
      return this.api.getContactDetails(params.id).then(contact => {       
        this.contact = <Contact>contact;
        this.routeConfig.navModel.setTitle(this.contact.firstName);
        this.originalContact = JSON.parse(JSON.stringify(this.contact));
        this.ea.publish(new ContactViewed(this.contact));
      });
    }
  }

  bind() {
    log.debug('ContactDetail.bind');
    ValidationRules
      .ensure('email').email().required()
      .on(this.contact);
  }

  get canSave() {
    return this.contact.firstName && this.contact.lastName && !this.api.isRequesting && !this.valCtl.errors.length;
  }

  save() {

    this.api.saveContact(this.contact).then(contact => {
      this.contact = <Contact>contact;
      this.routeConfig.navModel.setTitle(this.contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(this.contact));
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
}