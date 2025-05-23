import React, { useEffect, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';
import { FaAngleLeft, FaAngleRight, FaSortDown, FaSortUp } from 'react-icons/fa';
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';

interface TanstackTableProps {
    data: any[];
    columns: ColumnDef<any>[];
    sortingState: SortingState;
    onSortingChange: (sorting: SortingState) => void;
    parentPagination: PaginationState;
    onPaginationChange: (pagination: PaginationState) => void;
}

const TanstackTable: React.FC<TanstackTableProps> = (props) => {
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: props.sortingState[0]?.id || 'first_name',
            desc: props.sortingState[0]?.desc || false,
        }
    ]);

    const [pagination, setPagination] = useState({
        pageIndex: props.parentPagination.pageIndex,
        pageSize: props.parentPagination.pageSize,
    });

    useEffect(() => {
        // Only call onSortingChange if sorting has actually changed
        if ((sorting.length > 0) && (sorting[0].desc !== props.sortingState[0].desc || sorting[0].id !== props.sortingState[0].id)) {
            props.onSortingChange(sorting);
        }
        () => { return; }
    }, [sorting]);

    useEffect(() => {
        // Inform the parent about pagination changes
        if (
            pagination.pageIndex !== props.parentPagination.pageIndex ||
            pagination.pageSize !== props.parentPagination.pageSize
        ) {
            props.onPaginationChange(pagination);
        }
        () => { return; }
    }, [pagination]);

    const table = useReactTable({
        data: props.data,
        columns: props.columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        manualPagination: true,
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div>
            <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-blue-100'>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-800 tracking-wider">
                                    {header.isPlaceholder ? null : (
                                        <div
                                            // Make department column non-sortable 
                                            className={`select-none ${header.column.id !== 'department_name' ? 'cursor-pointer' : ''}`}
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
            <div className='flex items-center justify-center gap-10 p-4'>

                {/* First page */}
                <button
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <FaAnglesLeft />
                </button>
                {/* Previous page */}
                <button
                    onClick={() => {
                        setPagination((prev) => ({
                            ...prev,
                            pageIndex: prev.pageIndex - 1,
                        }));
                        table.previousPage()
                    }}
                    disabled={!table.getCanPreviousPage()}
                >
                    <FaAngleLeft />
                </button>
                {pagination.pageIndex}
                {/* Next page */}
                <button
                    onClick={() => {
                        setPagination((prev) => ({
                            ...prev,
                            pageIndex: prev.pageIndex,
                        }));
                        table.nextPage()
                    }}
                // disabled={!table.getCanNextPage()}
                >
                    <FaAngleRight />
                </button>

                {/* TODO   Commented because table.lastPage() does not work */}
                {/* End of listy */}
                {/* <button
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <FaAnglesRight />
                </button> */}
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            {pageSize}
                        </option>
                    ))}
                </select>
            </div>


        </div>
    );
};

export default TanstackTable;