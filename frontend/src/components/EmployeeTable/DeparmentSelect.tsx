import React, { useState, useEffect } from 'react';
import { SyncLoader } from 'react-spinners';

import { Departments } from '../../api/apiConfig';
import { DepartmentOption } from '../../utils/types';

interface DepartmentSelectProps {
    selectDepartment: (department: string) => void;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = (props) => {
    const [departmentOptions, setDepartments] = useState<DepartmentOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");


    useEffect(() => {
        const fetchDepartmentsFromAPI = async () => {
            setLoading(true);
            try {
                const response = await Departments.all();

                // Simplify the Department list
                const departmentList: DepartmentOption[] = []
                response.data.map((element) => {
                    departmentList.push({
                        "label": element.name,
                        "value": element.name
                    })

                })

                setDepartments(departmentList);
                setError("");
            } catch (err) {
                setError("Error fetching departments");
                console.error('Error fetching departments:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDepartmentsFromAPI();
    }, []);


 const selectDepartment = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDepartment = event.target.value;
        props.selectDepartment(selectedDepartment);
    };


    return (
        <div className='pb-10'>
            {loading ? <SyncLoader color="#36d7b7" size={10} />
                : error !== "" ? <div>{error}</div> :
                    <>
                        <label htmlFor="department">Filter by Departments: </label>
                        <select id="department" name="department" onChange={selectDepartment}
                            defaultValue=""
                            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm">
                            <option value=""> </option>
                            {departmentOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </>

            }
        </div>
    );
};

export default DepartmentSelect;