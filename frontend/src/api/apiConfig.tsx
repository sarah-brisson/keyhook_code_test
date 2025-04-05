import { Model, SpraypaintBase, Attr } from 'spraypaint';

@Model()
class ApplicationRecord extends SpraypaintBase {
  // store api url in a .env file for easier configuration
  static baseUrl = import.meta.env.VITE_API_URL;
  static apiNamespace = "/api/v1"
}

@Model()
export class Departments extends ApplicationRecord {
  static jsonapiType = "departments"

  @Attr() name: string
}
