/*
 *  IJ170916 Added enetity validation - Email or Phone.
 */
import {ValidationRules} from 'aurelia-validation';
import {log} from './log';

export class Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
         
  constructor({id = 0, firstName = '', lastName = '', email = '', phoneNumber = ''} = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    log.debug('Contact.constructor - id:'+ id + ', firstName:' + firstName);
  }

  clone() {
    var newContact = {
      id: this.id, 
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber
    }
    return new Contact(newContact);
  }
}

ValidationRules.customRule(
  'oneContact',
  (value, obj) => obj.email || obj.phoneNumber,
  'You must enter either an Email or Phone Number.'
);

ValidationRules
  .ensure('firstName').required()
  .ensure('lastName').required().minLength(2)
  .ensure('email').email()
  .ensureObject().satisfiesRule('oneContact')
  .on(Contact);