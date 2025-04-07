import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, InputNumber } from 'antd';
import DepartmentSelect from './DeparmentSelect';
import { DepartmentOption } from '../../utils/types';
import { Employees } from '../../api/apiConfig';

const NewEmployeeForm: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [form] = Form.useForm();

    const handleDepartmentSelect = (department: DepartmentOption | undefined) => {
        if (department === undefined) {
            setSelectedDepartment('');
        } else {
            // Set the selected department id in the state
            setSelectedDepartment(department.value);
        }
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const createNewEmployee = async (newEmployee: any) => {
        try {
            const response = await Employees.createNewEmployee(newEmployee)
            if (response.created) {
                setIsModalVisible(false);
            } else {
                setErrorMessage(response.message)
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                const newEmployeeData = {
                    ...values,
                    department_id: selectedDepartment,
                };

                if (!selectedDepartment) {
                    console.error('Validation Failed: Department is required.');
                    return;
                }

                createNewEmployee(newEmployeeData);
                // setIsModalVisible(false);
                // form.resetFields();
            })
            .catch((info) => {
                console.error('Validation Failed:', info);
            });
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Add New Employee
            </Button>
            <Modal
                title="Add New Employee"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Create"
                cancelText="Cancel"
            >
                <p className="text-red-500">{errorMessage}</p>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="First Name"
                        name="first_name"
                        rules={[{ required: true, message: 'Please input the first name!' }]}
                    >
                        <Input placeholder="Enter first name" />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="last_name"
                        rules={[{ required: true, message: 'Please input the last name!' }]}
                    >
                        <Input placeholder="Enter last name" />
                    </Form.Item>
                    <Form.Item
                        label="Age"
                        name="age"
                        rules={[
                            { required: true, message: 'Please input the age!' },
                            { type: 'number', min: 0, message: 'Age must be a positive number!' },
                        ]}
                    >
                        <InputNumber placeholder="Enter Age" />
                    </Form.Item>
                    <Form.Item
                        label="Position"
                        name="position"
                        rules={[{ required: true, message: 'Please input the position!' }]}
                    >
                        <Input placeholder="Enter position" />
                    </Form.Item>
                    <DepartmentSelect selectDepartment={handleDepartmentSelect} />
                    {/* <Form.Item
                        label="Department"
                        name="department"
                    >
                    </Form.Item> */}
                </Form>
            </Modal>
        </>
    );
};

export default NewEmployeeForm;