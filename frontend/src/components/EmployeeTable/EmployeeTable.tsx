import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { PuffLoader } from 'react-spinners';

import { Departments, Employees } from '../../api/apiConfig';
import { Department, Employee, EmployeeResponse } from '../../utils/types';
import TanstackTable from '../common/Table';
import InputFilter from './InputFilter';


const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [parentSorting, setParentSorting] = useState<SortingState>([]);
  const initialPageIndex = 1  //default page index
  const initialPageSize = 20 //default page size
  const [parentPagination, setParentPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });
  const [textFilter, setTextFilter] = useState<string>("");

  useEffect(() => {
    const fetchDepartmentsFromAPI = async () => {
      setLoading(true);
      try {
        const response = await Departments.all();

        // Simplify the Department list
        const departmentList: Department[] = []
        response.data.map((element) => {
          departmentList.push({
            "id": element.id,
            "name": element.name
          })
        })

        // Save simplified list to local storage for easier access
        // For more complex or sensitive data, Redux or another storage library would be better
        localStorage.setItem('departments', JSON.stringify(departmentList));

        setDepartments(departmentList);
        setError("");
      } catch (err) {
        setError("Error fetching departments");
        console.error('Error fetching departments:', err);
      }
    }

    const loadDepartments = () => {
      // If the department list already exists in the local Storage, don't fetch it
      let departmentStorage = localStorage.getItem('departments')
      if (!departmentStorage || departmentStorage.length === 0) {
        fetchDepartmentsFromAPI();
      } else {
        // Parse the local storage item into a list of Departments
        try {
          departmentStorage = JSON.parse(departmentStorage);
          if (Array.isArray(departmentStorage)) {
            const departmentList: Department[] = departmentStorage.map((resource) => ({
              id: resource.id,
              name: resource.name,
            }));
            setDepartments(departmentList);
          }
        } catch (error) {
          console.error("Error parsing department data from local storage:", error);
          // If there is an issue with the object, remove it and fetch from API
          localStorage.removeItem('departments');
          fetchDepartmentsFromAPI();
        }
      }
    }

    loadDepartments()
  }, []);

  useEffect(() => {
    // If the text filter changes, fetch the employees with applied filter
    if (textFilter.length > 0) {
      findEmployeesByName();
    }
  }, [textFilter])


  const buildOrderInstructions = () => {
    let sortString = ""
    if (parentSorting && parentSorting.length > 0) {

      console.log(parentSorting)
      sortString = parentSorting[0].desc ? '-' : '' + parentSorting[0].id
    }

    return sortString
  }

  const buildEmployeeList = (apiResponse: EmployeeResponse[]) => {
    // Set the Employee List
    const employeeList: Employee[] = []
    apiResponse.map((employee) => {
      const newEmployee: Employee = {
        id: "",
        firstName: "",
        lastName: "",
        age: "",
        position: "",
        department_id: "",
        department_name: ""
      }

      newEmployee.id = employee.id ? employee.id : ""
      newEmployee.firstName = employee.first_name ? employee.first_name : ""
      newEmployee.lastName = employee.last_name ? employee.last_name : ""
      newEmployee.age = employee.age ? employee.age : ""
      newEmployee.position = employee.position ? employee.position : ""
      newEmployee.department_id = employee.department_id ? employee.department_id : ""
      // Find the department name from the departments list with the id
      if (employee.department && employee.department?.name) {
        newEmployee.department_name = employee.department.name ? employee.department.name : "";
      }

      employeeList.push(newEmployee)
    })
    return employeeList
  }

  async function findEmployeesByName() {
    const sortString = buildOrderInstructions()
    Employees.findByName(textFilter, parentPagination.pageIndex, parentPagination.pageSize, sortString).then((response) => {
      if (response && Array.isArray(response)) {
        // Set the Employee List
        const employeeList = buildEmployeeList(response)

        setLoading(false);
        setEmployees(employeeList);
        setError("");
      } else {
        setLoading(false);
        setError("No employees found with that name");
      }
    })
  }

  const fetchEmployees = async () => {
    try {
      const sortString = buildOrderInstructions()
      // API Call to fetch employees
      const response = await Employees.getAll(parentPagination.pageIndex, parentPagination.pageSize, sortString)

      console.log(response)
      if (response && response.data && Array.isArray(response.data)) {
        const employeeList = buildEmployeeList(response.data)
        setLoading(false);
        setEmployees(employeeList);
        setError("");
      } else {
        setLoading(false);
        setError("Error fetching employees");
      }
    } catch (err) {
      setLoading(false);
      setError("Error fetching employees");
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEmployees();
  }, [departments])

  useEffect(() => {
    // If the sorting changes, fetch the employees again
    if (parentSorting.length > 0) {
      fetchEmployees();
    }
  }, [parentSorting])

  useEffect(() => {
    fetchEmployees();
  }, [parentPagination])

  const handlePaginationChange = (newPagination: PaginationState) => {
    setParentPagination(newPagination);
  };


  // Columns for the Tanstack Table
  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        header: 'First Name',
        accessorKey: 'firstName',
        id: 'first_name',
        enableSorting: true,
      },
      {
        header: 'Last Name',
        accessorKey: 'lastName',
        id: 'last_name',
        enableSorting: true,
      },
      {
        header: 'Age',
        accessorKey: 'age',
        id: 'age',
        enableSorting: true,
      },
      {
        header: 'Position',
        accessorKey: 'position',
        id: 'position',
        enableSorting: true,
      },
      {
        header: 'Department Name',
        id: 'department_name',
        accessorFn: (row) => row.department_name,
        enableSorting: false,
      },
    ],
    []
  );

  return (
    <div className='flex justify-center flex-col p-10'>
      <InputFilter onTextChange={setTextFilter} />
      {loading ? <PuffLoader
        color="green"
        size={60}
        aria-label="Loading Spinner"
        data-testid="loader"
      /> : error !== "" ? <div>{error}</div> :
        <TanstackTable
          data={employees}
          columns={columns}
          onSortingChange={setParentSorting}
          parentPageIndex={initialPageIndex}
          parentPageSize={initialPageSize}
          onPaginationChange={handlePaginationChange}
        />
      }
    </div>
  );
};

export default EmployeeTable;