
import React from 'react';
import IconButton from './IconButton';
import ChevronLeftIcon from './icons/ChevronLeftIcon'; // Assuming you have this or will create
import ChevronRightIcon from './icons/ChevronRightIcon';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Basic page numbers logic (can be enhanced for more complex scenarios)
  const pageNumbers = [];
  const maxPagesToShow = 5; // Max number of page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }


  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <div className="flex items-center space-x-2">
        <IconButton
          onClick={handlePrevious}
          disabled={currentPage === 1}
          label="Previous page"
          className="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Previous
        </IconButton>

        {startPage > 1 && (
           <>
            <button onClick={() => onPageChange(1)} className={`px-3 py-1.5 text-sm rounded-md ${1 === currentPage ? 'bg-primary text-white' : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600'}`}>
                1
            </button>
            {startPage > 2 && <span className="px-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400">...</span>}
           </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1.5 text-sm rounded-md min-w-[36px]
                        ${number === currentPage 
                          ? 'bg-primary text-white font-semibold' 
                          : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600'}`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
            <>
                {endPage < totalPages -1 && <span className="px-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400">...</span>}
                <button onClick={() => onPageChange(totalPages)} className={`px-3 py-1.5 text-sm rounded-md ${totalPages === currentPage ? 'bg-primary text-white' : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600'}`}>
                    {totalPages}
                </button>
            </>
        )}

        <IconButton
          onClick={handleNext}
          disabled={currentPage === totalPages}
          label="Next page"
          className="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRightIcon className="w-5 h-5 ml-1" />
        </IconButton>
      </div>
      <span className="text-sm text-neutral-600 dark:text-neutral-400">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default PaginationControls;
