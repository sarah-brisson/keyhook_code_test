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

  static async getAll(pageNumber: number, pageSize: number, sort: string) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiNamespace}/employees?page[number]=${String(pageNumber)}&page[size]=${String(pageSize)}&sort=${sort}&include=department`);
      if (response.ok) {
        const json = await response.json();
        return json;
      } else if (response.status === 404) {
        return {};
      } else {
        console.error('Error searching employees:', response.status, response.statusText);
        return {};
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      return {};
    }
  }

  static async findByName(searchText: string, pageNumber: number, pageSize: number, sort: string) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiNamespace}/employees/find/${searchText}?page[number]=${String(pageNumber)}&page[size]=${String(pageSize)}&sort=${sort}&include=department`);
      if (response.ok) {
        const json = await response.json();
        return json;
      } else if (response.status === 404) {
        return {};
      } else {
        console.error('Error searching employees:', response.status, response.statusText);
        return {};
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      return {};
    }
  }

  static async getEmployeeListByDepartmentName(departmentName: string, pageNumber: number, pageSize: number, sort: string, searchText: string = "") {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiNamespace}/departments/find/${departmentName}/employees?employee_name=${searchText}&page[number]=${String(pageNumber)}&page[size]=${String(pageSize)}&sort=${sort}&include=department`);
      if (response.ok) {
        const json = await response.json();
        return json;
      } else if (response.status === 404) {
        return {};
      } else {
        console.error('Error searching employees per department:', response.status, response.statusText);
        return {};
      }
    } catch (error) {
      console.error('Error searching employees per department:', error);
      return {};
    }
  }

  static async createNewEmployee(body: any) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiNamespace}/employees`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(body)
        })
      if (response.ok) {
        return { message: "New Employee Created", created: true }
      } else if (response.status === 409) {
        return { message: "An employee with the same first and last name already exists in this Department", created: false }
      } else {
        console.error('Error searching employees per department:', response.status, response.statusText);
        return { message: "An error occured", created: false }
      }
    } catch (error) {
      console.error('Error searching employees per department:', error);
      return { message: "An error occured", created: false }
    }
  }
}
