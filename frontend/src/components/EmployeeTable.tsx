import React, { useState, useEffect } from 'react';
import { Departments, Employees } from '../api/apiConfig';
import { Department, Employee } from '../utils/types';


const EmployeeTable: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

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
        setError(false);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
        console.error('Error fetching departments:', err);
      }
    }

    const loadDepartments = () => {
      // If the department list already exists in the local Storage, don't fetch it
      let departmentStorage = localStorage.getItem('departments')
      console.log(departmentStorage)
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
    const fetchEmployees = async () => {
      try {
        const response = await Employees
          .includes("department")
          .all();

          if (response.raw && response.raw.data) {
          const rawEmployeedata = response.raw.data
          if (Array.isArray(rawEmployeedata)) {
            // Transform the raw data into a list of Employee objects to be used in the table
            const employeeList: Employee[] = []
            rawEmployeedata.map((employee) => {
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
              if (employee.attributes) {
                if ("first_name" in employee.attributes && employee.attributes["first_name"] != undefined) {
                  newEmployee.firstName = String(employee.attributes["first_name"])
                }
                if ("last_name" in employee.attributes && employee.attributes["last_name"] != undefined) {
                  newEmployee.lastName = String(employee.attributes["last_name"])
                }
                if ("age" in employee.attributes && employee.attributes["age"] != undefined) {
                  newEmployee.age = String(employee.attributes["age"])
                }
                if ("position" in employee.attributes && employee.attributes["position"] != undefined) {
                  newEmployee.position = String(employee.attributes["position"])
                }
              }

              // Get department from relationships
              if (
                employee.relationships
                && "department" in employee.relationships
                && employee.relationships["department"] != undefined
              ) {
                // Parse the department relationship
                const employeeDepartment = JSON.parse(JSON.stringify(employee.relationships["department"]))
                if (employeeDepartment.data) {
                  const departmentData = employeeDepartment.data
                  if (departmentData.id) {
                    newEmployee.department_id = String(departmentData.id);
                    // Find the department name from the departments list with the id
                    // This is a bit inefficient, but it works for small lists
                    const department = departments.find(dept => dept.id === departmentData.id);
                    newEmployee.department_name = department ? department.name : "";
                  }

                }
              }
              employeeList.push(newEmployee)
            })
            setEmployees(employeeList);
          }
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchEmployees();
  }, [departments])

  return (
    <>
    </>
  );
};

export default EmployeeTable;