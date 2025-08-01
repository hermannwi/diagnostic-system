import React, { useState } from 'react';

export default function ProductForm() {

    // function handleChange() {
    //     setInputValue(inputValue)
        
    // }

    function handleSubmit(event) {
        event.preventDefault()
        const formEl = event.target
        const formData = new FormData(formEl)
        const product = formData.get("product")
        console.log(product)
        formEl.reset()
    }

    
    return (
        <section>
            <h1>Product Form</h1>
            <form onSubmit={handleSubmit} method='post'>
                <label htmlFor="product">Product: </label>
                <input
                id='product'
                type="text"
                name='product'
                
            />
            <button>ADD</button>
                
            </form>
        </section>
    )
    
}