import React, { useEffect, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { FaSortDown, FaSortUp } from 'react-icons/fa';

interface TanstackTableProps {
    data: any[];
    columns: ColumnDef<any>[];
    onSortingChange: (sorting: SortingState) => void;
}

const TanstackTable: React.FC<TanstackTableProps> = (props) => {
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        console.log(sorting);
        props.onSortingChange(sorting);
    }, [sorting]);

    const table = useReactTable({
        data: props.data,
        columns: props.columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        state: { sorting },
        onSortingChange: setSorting,
    });

    return (
        <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-blue-100'>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-800 tracking-wider">
                                {header.isPlaceholder ? null : (
                                    // Make department column non-sortable 
                                    <div
                                        className={`select-none ${header.column.id !== 'department_name' ? 'cursor-pointer' : ''
                                            }`}
                                        onClick={
                                            header.column.id !== 'department_name'
                                                ? header.column.getToggleSortingHandler()
                                                : undefined
                                        }
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {/* Icons for sorting */}
                                        {header.column.getIsSorted() === 'asc' ? (
                                            <FaSortUp className="inline-block ml-1" />
                                        ) : null}
                                        {header.column.getIsSorted() === 'desc' ? (
                                            <FaSortDown className="inline-block ml-1" />
                                        ) : null}

                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row, index) => (
                    <tr key={row.id} className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}
                                className='px-6 py-4 whitespace-nowrap text-sm text-gray-800'>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TanstackTable;