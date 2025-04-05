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
    async function fetchDepartments() {
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

    fetchDepartments();
  }, []);


  return (
    <>
    </>
  );
};

export default EmployeeTable;