import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { PuffLoader } from 'react-spinners';

import { Employees } from '../../api/apiConfig';
import { DepartmentOption, Employee, EmployeeResponse } from '../../utils/types';
import TanstackTable from '../common/Table';
import InputFilter from './InputFilter';
import DepartmentSelect from './DeparmentSelect';
import NewEmployeeForm from './NewEmployeeForm';


const EmployeeTable: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [parentSorting, setParentSorting] = useState<SortingState>([{
    id: 'first_name',
    desc: false,
  }]);
  const initialPageIndex = 1  //default page index
  const initialPageSize = 20 //default page size
  const [parentPagination, setParentPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });
  const [textFilter, setTextFilter] = useState<string>("");

  // Function to add the sorting request to the API calls
  const buildOrderInstructions = () => {
    let sortString = ""
    if (parentSorting && parentSorting.length > 0) {
      sortString = (parentSorting[0].desc ? '-' : '') + parentSorting[0].id
    }
    return sortString
  }

  // Function to build the list of Employee objects from the API response
  const buildEmployeeList = (apiResponse: EmployeeResponse[]) => {
    const employeeList: Employee[] = []
    apiResponse.map((employee) => {
      // Create a new Employee object with the data from the API response
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
    setLoading(true);
    const sortString = buildOrderInstructions()
    Employees.findByName(textFilter, parentPagination.pageIndex, parentPagination.pageSize, sortString).then((response) => {
      if (response && Array.isArray(response)) {
        // Set the Employee List
        const employeeList = buildEmployeeList(response)

        setLoading(false);
        setEmployees(employeeList);
        setError("");
        // Set the pagination state to the first page
        if (parentPagination.pageIndex > 1) {
          setParentPagination({
            pageIndex: initialPageIndex,
            pageSize: parentPagination.pageSize,
          })
        }
      } else {
        setLoading(false);
        setError("No employees found with that name");
      }
    })
  }

  async function findEmployeesByDepartment() {
    setLoading(true);
    const sortString = buildOrderInstructions()
    Employees.getEmployeeListByDepartmentName(selectedDepartment, parentPagination.pageIndex, parentPagination.pageSize, sortString, textFilter).then((response) => {
      if (response && Array.isArray(response)) {
        // Set the Employee List
        const employeeList = buildEmployeeList(response)

        setLoading(false);
        setEmployees(employeeList);
        setError("");
        // Set the pagination state to the first page
        if (parentPagination.pageIndex > 1) {
          setParentPagination({
            pageIndex: initialPageIndex,
            pageSize: parentPagination.pageSize,
          })
        }
      } else {
        setLoading(false);
        setError("No employees found for this Department");
      }
    })
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const sortString = buildOrderInstructions()
      // API Call to fetch employees
      const response = await Employees.getAll(parentPagination.pageIndex, parentPagination.pageSize, sortString)

      if (response && response.data && Array.isArray(response.data)) {
        const employeeList = buildEmployeeList(response.data)
        setLoading(false);
        setEmployees(employeeList);
        setError("");
        // Set the pagination state to the first page
        if (parentPagination.pageIndex > 1) {
          setParentPagination({
            pageIndex: initialPageIndex,
            pageSize: parentPagination.pageSize,
          })
        }
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
    // When a department is selected, fetch the employees for that department 
    if (selectedDepartment.length > 0) {
      findEmployeesByDepartment();
    } else {
      // If no department is selected, fetch all employees
      fetchEmployees()
    }
  }
    , [selectedDepartment]);

  useEffect(() => {
    // If the sorting changes, fetch the employees again
    if (textFilter.length > 0) {
      findEmployeesByName();
    } else
      if (parentSorting.length > 0) {
        fetchEmployees();
      }
  }, [parentSorting, parentPagination])

  useEffect(() => {
    // If the text filter changes, fetch the employees with applied filter
    if (textFilter.length > 0) {
      findEmployeesByName();
    } else {
      fetchEmployees()
    }
  }, [textFilter])

  const handlePaginationChange = (newPagination: PaginationState) => {
    setParentPagination(newPagination);
  };

  const handleSortingChange = (newSort: SortingState) => {
    setParentSorting(newSort);
  };

  const handleDepartmentSelect = (departmentOption: DepartmentOption | undefined) => {
    if (departmentOption !== undefined) {
      setSelectedDepartment(departmentOption.label);
    }
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
      <DepartmentSelect selectDepartment={handleDepartmentSelect} />
      <div className='flex justify-end pb-10'>
        <NewEmployeeForm />
      </div>
      {loading ? <PuffLoader
        color="green"
        size={60}
        aria-label="Loading Spinner"
        data-testid="loader"
        className='flex justify-center align-center m-20'
      /> : error !== "" ? <div>{error}</div> :
        <TanstackTable
          data={employees}
          columns={columns}
          sortingState={parentSorting}
          onSortingChange={handleSortingChange}
          parentPagination={parentPagination}
          onPaginationChange={handlePaginationChange}
        />
      }
    </div>
  );
};

export default EmployeeTable;