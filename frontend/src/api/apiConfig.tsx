import { Model, SpraypaintBase, Attr, BelongsTo, HasMany } from 'spraypaint';

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

  @HasMany() employees: Employees[]
}

@Model()
export class Employees extends ApplicationRecord {
  static jsonapiType = "employees"

  @Attr() firstName: string
  @Attr() lastName: string
  @Attr() age: Number
  @Attr() position: string

  @BelongsTo() departments: Departments

}
