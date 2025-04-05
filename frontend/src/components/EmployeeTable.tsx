import React, { useState, useEffect } from 'react';
import { Departments } from '../api/apiConfig';


interface Department {
  id: string;
  name: string;
}

const EmployeeTable: React.FC = () => {
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


  return (
    <>
    </>
  );
};

export default EmployeeTable;