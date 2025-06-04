import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

const renderCustomPagination = (currentPage: number, lastPage: number): (number | string)[] => {
    const pages: (number | string)[] = [];

    pages.push(1);

    if (currentPage > 4) {
        pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage < lastPage - 3) {
        pages.push('...');
    }

    if (lastPage > 1) {
        pages.push(lastPage);
    }

    return pages;
};

const CustomPagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange }) => {
    return (
        <div className="border-t pt-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                >
                    &laquo;
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    &lsaquo;
                </Button>

                {renderCustomPagination(currentPage, lastPage).map((item, idx) =>
                    item === '...' ? (
                        <span key={idx} className="px-2 text-gray-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={idx}
                            size="sm"
                            variant={item === currentPage ? 'default' : 'outline'}
                            onClick={() => onPageChange(item as number)}
                            className={`rounded px-3 py-1 text-sm ${
                                item === currentPage
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                            }`}
                        >
                            {item}
                        </Button>
                    )
                )}

                <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    &rsaquo;
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === lastPage}
                    onClick={() => onPageChange(lastPage)}
                >
                    &raquo;
                </Button>
            </div>
        </div>
    );
};

export default CustomPagination;
