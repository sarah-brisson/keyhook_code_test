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

export interface DepartmentOption {
  value: string;
  label: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface EmployeeResponse {
  id: string;
  first_name: string;
  last_name: string; age:
  string; position: string;
  department_id: string;
  department: {
    name: string;
    id: string
  };
}