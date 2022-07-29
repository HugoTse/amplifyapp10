import React from 'react';


const Page = ({ postsPerPage, totalPosts, paginate }) => {
    const pageNumbers = [];
    for(let i = 1; i <= Math.ceil(totalPosts / postsPerPage ); i++){
        pageNumbers.push(i);
    }


    return (
        <> 
        {pageNumbers.map(number => (
        <div className='pagination'>
            <a
            onClick={() => paginate(number)} 
            href='!#'>
                {number}
            </a>
        </div>
        ))}

        </>
      
    )
}

export default Page