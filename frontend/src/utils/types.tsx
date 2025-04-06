export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  age: string;
  position: string;
  department_id: string;
  department_name: string
}

export interface Department {
  id: string;
  name: string;
}