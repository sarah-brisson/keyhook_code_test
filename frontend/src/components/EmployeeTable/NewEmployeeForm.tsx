import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, InputNumber } from 'antd';
import DepartmentSelect from './DeparmentSelect';
import { DepartmentOption } from '../../utils/types';
import { Employees } from '../../api/apiConfig';
import { capitalizeFirstLetter } from '../../utils/textTreatment';

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
                    first_name: capitalizeFirstLetter(values.first_name),
                    last_name: capitalizeFirstLetter(values.last_name),
                    position: capitalizeFirstLetter(values.position),
                    department_id: selectedDepartment,
                };

                if (!selectedDepartment) {
                    console.error('Validation Failed: Department is required.');
                    return;
                }

                createNewEmployee(newEmployeeData);
                form.resetFields();
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
                        rules={[
                            { required: true, message: 'Please input the first name!' },
                            { pattern: /^[a-zA-Z\s]*$/, message: 'First name must not contain extra characters' },
                        ]}
                    >
                        <Input placeholder="Enter first name" />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="last_name"
                        rules={[
                            { required: true, message: 'Please input the last name!' },
                            { pattern: /^[a-zA-Z\s]*$/, message: 'Last name must not contain extra characters' },
                        ]}
                    >
                        <Input placeholder="Enter last name" />
                    </Form.Item>
                    <Form.Item
                        label="Age"
                        name="age"
                        rules={[
                            { required: true, message: 'Please input the age!' },
                            { type: 'number', min: 15, max: 100, message: 'Must be a reasonable age' },
                        ]}
                    >
                        <InputNumber placeholder="Enter Age" />
                    </Form.Item>
                    <Form.Item
                        label="Position"
                        name="position"
                        rules={[
                            { required: true, message: 'Please input the position!' },
                        ]}
                    >
                        <Input placeholder="Enter position" />
                    </Form.Item>
                    <DepartmentSelect selectDepartment={handleDepartmentSelect} />
                </Form>
            </Modal>
        </>
    );
};

export default NewEmployeeForm;