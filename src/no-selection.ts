import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {NoContact} from './messages';

@inject(EventAggregator)

export class NoSelection {
  
  message = "Please Select a Contact.";

  constructor(private ea: EventAggregator) { }
    
  activate(params, routeConfig) {
    this.ea.publish(new NoContact);
  }

}