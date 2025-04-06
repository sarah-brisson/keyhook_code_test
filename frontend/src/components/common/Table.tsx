import React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface TanstackTableProps {
    data: any[];
    columns: ColumnDef<any>[];
}

const TanstackTable: React.FC<TanstackTableProps> = (props) => {

    const table = useReactTable({
        data: props.data,
        columns: props.columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-blue-100'>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-800 tracking-wider">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
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