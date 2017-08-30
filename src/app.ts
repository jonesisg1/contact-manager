import {Router, RouterConfiguration} from 'aurelia-router';

import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {NavigateTo} from './messages';

@inject(EventAggregator)

export class App {
  router: Router;

  constructor(private ea: EventAggregator) { 
    ea.subscribe(NavigateTo, msg => {
      this.router.navigateToRoute('contacts', { id: msg.contact.id })
    });
  }

  configureRouter(config: RouterConfiguration, router: Router){
    config.title = 'Contacts';
    config.map([
      { route: '',              moduleId: 'no-selection',   name:'none', title: 'Select' },
      { route: 'new',           moduleId: 'contact-detail', name:'new', title: 'New' },
      { route: 'contacts/:id',  moduleId: 'contact-detail', name:'contacts' }
    ]);

    this.router = router;
  }
}