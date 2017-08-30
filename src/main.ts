import {Aurelia, LogManager} from 'aurelia-framework'
import environment from './environment';

import {ConsoleAppender} from "aurelia-logging-console";
 
LogManager.addAppender(new ConsoleAppender());


export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .plugin('aurelia-validation')
    .feature('resources');

  if (environment.debug) {
    //aurelia.use.developmentLogging();
    LogManager.setLevel(LogManager.logLevel.debug);
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
