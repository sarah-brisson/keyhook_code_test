import React, { useState, ChangeEvent } from 'react';
import { IoIosClose } from 'react-icons/io';

interface ChildInputProps {
    onTextChange: (text: string) => void;
}

const InputFilter: React.FC<ChildInputProps> = ({ onTextChange }) => {
    const [inputText, setInputText] = useState('');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newText = event.target.value;
        setInputText(newText);
        // Send the updated text to the parent component
        onTextChange(newText);
    };

    return (
        <div className="flex items-center justify-start gap-2 mb-4">
            <label htmlFor="inputText">Filter by first name or last name: </label>
            <input
                type="text"
                id="inputText"
                value={inputText}
                onChange={handleChange}
                className='text-px-sm border-2 border-gray-300 rounded-md p-1'
            />
            <IoIosClose onClick={() => setInputText("")} className='cursor-pointer' />
        </div>
    );
};

export default InputFilter;