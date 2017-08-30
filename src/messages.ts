export class ContactUpdated {
  constructor(public contact) { }
}

export class ContactViewed {
  constructor(public contact) { }
}

export class NoContact {
  constructor() { }
}

export class NavigateTo {
  constructor(public contact) { }
}
