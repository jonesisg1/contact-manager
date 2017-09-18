/*
 *  IJ170916 Added enetity validation - Email or Phone.
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
  entityErrors: Array<String> = [];
  
  constructor(private api: WebAPI, 
              private ea: EventAggregator,
              private valCtl: ValidationController) 
  {
    log.debug('ContactDetail.constructor');
    
    this.handleFocusout = e => {
      log.debug(e.target.tagName + ', ' + e.relatedTarget.tagName + ', '+ this.valCtl.errors.length);
      if (e.target.className.split(' ').indexOf('re-validate') > 0 ) {
        this.valCtl.validate()
          .then(valCtlResult => {
            log.debug('ContactDetail.handleFocusout - Num Errors:' + this.valCtl.errors.length);
            this.setEntityErrors(valCtlResult.results);
          })
      } 
    }
  }

  private handleFocusout(e) {
    // This is a stub.
    //https://ilikekillnerds.com/2016/02/using-event-listeners-in-aurelia/
  }

  private setEntityErrors(validationResults) {
    this.entityErrors = [];
    validationResults.forEach(result => {    
      if (!result.valid && result.propertyName === null) {
        log.debug(result.id + ', ' + result.message + ',' + result.propertyName);
        this.entityErrors.push(result.message);
      }
    })
  }

  attached() {
    document.addEventListener('focusout', this.handleFocusout);
  }

  detached() {
    document.removeEventListener('focusout', this.handleFocusout);
  }  

  activate(params, routeConfig) {
    this.routeConfig = routeConfig; 
    log.debug('ContactDetail.activate - routeConfig.name:' + this.routeConfig.name);
    log.debug('ContactDetail.activate - Num Errors:' + this.valCtl.errors.length);
    if(this.routeConfig.name == 'new') {
      this.doInit(new Contact());
      this.ea.publish(new ContactViewed(this.contact));
      this.hasFocusFirstName = true; 
    } else {
      return this.api.getContactDetails(params.id)
        .then(contact => {
          this.doInit(new Contact(contact));
          this.ea.publish(new ContactViewed(this.contact)); 
        });
    }
  }
  
  private doInit(contact:Contact) {
    if (this.contact) {
      this.valCtl.removeObject(this.contact);  
    } else {
      log.debug('ContactDetail.doInit - contact not yet set!')
    }
    this.contact = contact;
    this.valCtl.addObject(this.contact);
    this.originalContact = this.contact.clone();
    this.routeConfig.navModel.setTitle(this.contact.firstName || 'New'); 
  }

  get canSave() {
    return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
  }

  get changed() {
    return areEqual(this.originalContact, this.contact);
  }

  undo() {
    this.valCtl.removeObject(this.contact);
    this.contact = this.originalContact.clone(); // Remember we want a different object!
    this.valCtl.addObject(this.contact);
    this.valCtl.reset(); // Assume the original state was valid.
    this.entityErrors = [];
  }
  
  save() {
    log.debug('ContactDetail.save');
    this.valCtl.validate()
      .then(valCtlResult => {
        log.debug('ContactDetail.save - Num Errors:' + this.valCtl.errors.length);
        if(valCtlResult.valid) {
          this.api.saveContact(this.contact)
            .then(contact => {
              this.doInit(new Contact(contact));
              this.ea.publish(new ContactUpdated(this.contact));
            });
        } else {
          this.setEntityErrors(valCtlResult.results);
        };
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
    log.debug('ContactDetail.deactivate');
    this.valCtl.removeObject(this.contact);
    // Remove any error messages.
    this.valCtl.reset();
  }
}